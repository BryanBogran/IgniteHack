import SwiftUI
import AVFoundation
import Combine
import UIKit

struct TrackedObject: Decodable {
    let location: String
    let lastSeen: String
    let x: Int
    let y: Int

    enum CodingKeys: String, CodingKey {
        case location
        case lastSeen = "last_seen"
        case x
        case y
    }
}

@MainActor
final class ObjectLocationManager: ObservableObject {
    @Published var locations: [String: TrackedObject] = [:]
    @Published var lastErrorMessage: String?

    func fetchLocations(from endpoint: String) async {
        guard let url = URL(string: endpoint) else {
            lastErrorMessage = "Invalid API URL."
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse else {
                lastErrorMessage = "Invalid server response."
                return
            }

            guard 200..<300 ~= httpResponse.statusCode else {
                lastErrorMessage = "Server returned status \(httpResponse.statusCode)."
                return
            }

            let decoded = try JSONDecoder().decode([String: TrackedObject].self, from: data)
            locations = decoded
            lastErrorMessage = nil
        } catch {
            lastErrorMessage = error.localizedDescription
        }
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
    @AppStorage("mementoAPIBaseURL") private var apiBaseURL = "http://192.168.1.1:5050"
    @State private var locationMessage = ""
    @State private var isFetching = false
    private let synthesizer = AVSpeechSynthesizer()

    private let buttonConfigs: [ButtonConfig] = [
        ButtonConfig(label: "Where are my Keys?", key: "keys", symbol: "key.fill"),
        ButtonConfig(label: "Where is my Wallet?", key: "wallet", symbol: "wallet.pass.fill"),
        ButtonConfig(label: "Where are my Glasses?", key: "glasses", symbol: "eyeglasses")
    ]

    private var endpoint: String {
        "\(apiBaseURL.trimmingCharacters(in: .whitespacesAndNewlines))/api/objects"
    }

    var body: some View {
        VStack(spacing: 24) {
            VStack(alignment: .leading, spacing: 12) {
                Text("Python API Base URL")
                    .font(.headline)

                TextField("http://192.168.1.23:5050", text: $apiBaseURL)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                    .autocorrectionDisabled()
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))

                Text("Current endpoint: \(endpoint)")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            ForEach(buttonConfigs) { config in
                Button {
                    Task {
                        await fetchAndHandle(for: config.key)
                    }
                } label: {
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
                .disabled(isFetching)
                .accessibilityHint("Fetches the latest known location and announces it.")
                .accessibilityAddTraits(.isButton)
            }

            if let lastErrorMessage = locationManager.lastErrorMessage {
                Text(lastErrorMessage)
                    .font(.body.weight(.medium))
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
            }

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
        .task {
            await locationManager.fetchLocations(from: endpoint)
        }
        .refreshable {
            await locationManager.fetchLocations(from: endpoint)
        }
    }

    private func fetchAndHandle(for itemKey: String) async {
        isFetching = true
        defer { isFetching = false }

        await locationManager.fetchLocations(from: endpoint)
        handleLookup(for: itemKey)
    }

    private func handleLookup(for itemKey: String) {
        let feedback = UINotificationFeedbackGenerator()
        feedback.prepare()

        guard let info = locationManager.locations[itemKey] else {
            feedback.notificationOccurred(.error)
            let failMessage = "I could not find your \(itemKey) in the local memory."
            locationMessage = failMessage
            speak(failMessage)
            return
        }

        let message = "Your \(itemKey) were last seen at \(info.location) on \(info.lastSeen)."
        locationMessage = message
        feedback.notificationOccurred(.success)
        speak(message)
    }

    private func speak(_ text: String) {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate
        synthesizer.speak(utterance)
    }
}

#Preview {
    ContentView()
}
