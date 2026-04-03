import SwiftUI
import UIKit

struct AnchorObjectsResponse: Decodable {
    let objects: [AnchorObject]
    let count: Int
    let worker: WorkerStatus
}

struct AnchorObject: Decodable, Identifiable {
    var id: String { label }

    let label: String
    let zoneName: String?
    let lastSeenAt: String?
    let isVisible: Bool
    let confidence: Double?
    let centerX: Double?
    let centerY: Double?
    let trackId: Int?
    let visibilityState: String
}

struct WorkerStatus: Decodable {
    let lastHeartbeatAt: String?
    let cameraError: String
}

struct ContentView: View {
    @State private var statusMessage = "Tap the button to locate your keys."
    @State private var isLoading = false

    // Replace this with your laptop's current local Wi-Fi IP address.
    private let baseURL = "http://192.168.1.23:8765"

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Text("Project Anchor")
                .font(.largeTitle.bold())

            Text(statusMessage)
                .font(.title3)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            if isLoading {
                ProgressView("Looking for keys...")
            }

            Button(action: {
                Task {
                    await findObject(named: "keys")
                }
            }) {
                Text("Where are my keys?")
                    .font(.title2.bold())
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
            .padding(.horizontal)
            .disabled(isLoading)

            Spacer()
        }
        .padding()
    }

    @MainActor
    private func triggerSuccessHaptics() {
        let notification = UINotificationFeedbackGenerator()
        notification.prepare()
        notification.notificationOccurred(.success)

        let impact = UIImpactFeedbackGenerator(style: .heavy)
        impact.prepare()
        impact.impactOccurred(intensity: 1.0)
    }

    @MainActor
    private func triggerErrorHaptics() {
        let notification = UINotificationFeedbackGenerator()
        notification.prepare()
        notification.notificationOccurred(.error)
    }

    private func findObject(named objectName: String) async {
        await MainActor.run {
            isLoading = true
            statusMessage = "Checking the room..."
        }

        guard let encodedName = objectName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(baseURL)/api/objects?object=\(encodedName)") else {
            await MainActor.run {
                isLoading = false
                statusMessage = "The API address is invalid."
                triggerErrorHaptics()
            }
            return
        }

        var request = URLRequest(url: url)
        request.timeoutInterval = 5

        do {
            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                await MainActor.run {
                    isLoading = false
                    statusMessage = "No response from Anchor."
                    triggerErrorHaptics()
                }
                return
            }

            guard (200...299).contains(httpResponse.statusCode) else {
                if httpResponse.statusCode == 404 {
                    await MainActor.run {
                        isLoading = false
                        statusMessage = "I couldn't find your \(objectName) yet."
                        triggerErrorHaptics()
                    }
                } else {
                    await MainActor.run {
                        isLoading = false
                        statusMessage = "Anchor returned an error (\(httpResponse.statusCode))."
                        triggerErrorHaptics()
                    }
                }
                return
            }

            let decoded = try JSONDecoder().decode(AnchorObjectsResponse.self, from: data)

            guard let object = decoded.objects.first else {
                await MainActor.run {
                    isLoading = false
                    statusMessage = "No saved location for \(objectName)."
                    triggerErrorHaptics()
                }
                return
            }

            let zone = object.zoneName ?? "an unknown spot"
            let visibility = object.isVisible ? "It is visible now" : "I last saw it"
            let confidenceText: String

            if let confidence = object.confidence {
                confidenceText = " Confidence: \(Int(confidence * 100))%."
            } else {
                confidenceText = ""
            }

            await MainActor.run {
                isLoading = false
                statusMessage = "\(visibility) in \(zone).\(confidenceText)"
                triggerSuccessHaptics()
            }
        } catch {
            await MainActor.run {
                isLoading = false
                statusMessage = "Can't reach Anchor. Check Wi-Fi, laptop IP, and that the Python API is running."
                triggerErrorHaptics()
            }
        }
    }
}

#Preview {
    ContentView()
}
