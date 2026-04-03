import SwiftUI
import Combine
import AVFoundation
import UIKit

// Simple network manager for fetching locations.
class ObjectLocationManager: ObservableObject {
    @Published var locations: [String: [String: String]] = [:]
    @Published var lastError: Error?
    private var cancellable: AnyCancellable?
    
    // TODO: Paste your local IP below:
    private let endpoint = "http://[INSERT_LOCAL_IP]:5000/api/objects"

    func fetchLocations() {
        guard let url = URL(string: endpoint) else { return }
        cancellable = URLSession.shared.dataTaskPublisher(for: url)
            .map { $0.data }
            .decode(type: [String: [String: String]].self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                if case let .failure(error) = completion {
                    self?.lastError = error
                }
            }, receiveValue: { [weak self] locations in
                self?.locations = locations
            })
    }
}

struct ButtonConfig: Identifiable {
    let id = UUID()
    let label: String
    let key: String
    let symbol: String
}

struct ContentView: View {
    @StateObject private var locationManager = ObjectLocationManager()
    @State private var locationMessage: String = ""
    @State private var isFetching: Bool = false
    private let synthesizer = AVSpeechSynthesizer()
    
    let buttonConfigs: [ButtonConfig] = [
        ButtonConfig(label: "Where are my Keys?", key: "keys", symbol: "key.fill"),
        ButtonConfig(label: "Where is my Wallet?", key: "wallet", symbol: "wallet.pass.fill"),
        ButtonConfig(label: "Where are my Glasses?", key: "glasses", symbol: "eyeglasses")
    ]

    var body: some View {
        VStack(spacing: 36) {
            Spacer()
            ForEach(buttonConfigs) { config in
                Button(action: { fetchAndHandle(for: config.key) }) {
                    HStack(spacing: 24) {
                        Image(systemName: config.symbol)
                            .font(.system(size: 40, weight: .bold))
                        Text(config.label)
                            .font(.largeTitle.bold())
                            .foregroundStyle(.white)
                            .accessibilityLabel(config.label)
                    }
                    .frame(maxWidth: .infinity, minHeight: 110)
                    .background(Color.black)
                    .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 30)
                            .stroke(Color.white, lineWidth: 5)
                    )
                }
                .accessibilityHint("Announces location with haptic feedback.")
                .accessibilityAddTraits(.isButton)
            }
            Spacer()
            Text(locationMessage)
                .font(.title.weight(.semibold))
                .foregroundStyle(.yellow)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity, minHeight: 80)
                .accessibilityLabel(locationMessage)
            Spacer(minLength: 20)
        }
        .padding()
        .background(Color(.systemGray6))
        .onAppear {
            locationManager.fetchLocations()
        }
        .refreshable {
            locationManager.fetchLocations()
        }
    }

    func fetchAndHandle(for itemKey: String) {
        isFetching = true
        // Re-fetch data to ensure freshness
        locationManager.fetchLocations()
        // Wait a fraction, then check
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
            handleLookup(for: itemKey)
        }
    }
    
    func handleLookup(for itemKey: String) {
        let feedback = UINotificationFeedbackGenerator()
        feedback.prepare()
        guard let info = locationManager.locations[itemKey],
              let location = info["location"],
              let lastSeen = info["last_seen"] else {
            feedback.notificationOccurred(.error)
            let failMsg = "Sorry, I don't know where your \(itemKey)."
            locationMessage = failMsg
            speak(failMsg)
            return
        }
        let message = "Your \(itemKey) were last seen at \(location) on \(lastSeen)."
        locationMessage = message
        feedback.notificationOccurred(.success)
        speak(message)
    }

    func speak(_ text: String) {
        if synthesizer.isSpeaking { synthesizer.stopSpeaking(at: .immediate) }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate
        synthesizer.speak(utterance)
    }
}

#Preview {
    ContentView()
}
