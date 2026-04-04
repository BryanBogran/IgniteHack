import SwiftUI
import AVFoundation
import Combine
import Foundation
import UIKit

struct TrackedObject: Decodable {
    let location: String
}

@MainActor
final class ObjectLocationManager: ObservableObject {
    @Published var locations: [String: TrackedObject] = [:]
    @Published var lastErrorMessage: String?

    func fetchLocations(from endpoint: String) async {
        guard let url = URL(string: endpoint) else {
            lastErrorMessage = "The API URL is invalid."
            locations = [:]
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse,
                  200..<300 ~= httpResponse.statusCode
            else {
                lastErrorMessage = "The server returned an invalid response."
                locations = [:]
                return
            }

            let decoded = try JSONDecoder().decode([String: TrackedObject].self, from: data)
            locations = decoded
            lastErrorMessage = nil
        } catch {
            lastErrorMessage = error.localizedDescription
            locations = [:]
        }
    }
}

struct ButtonConfig: Identifiable {
    let label: String
    let displayName: String
    let key: String
    let symbol: String
    let fallbackLocation: String

    var id: String { key }
}

struct ContentView: View {
    @StateObject private var locationManager = ObjectLocationManager()
    @AppStorage("mementoAPIBaseURL") private var apiBaseURL = "http://0.0.0.0:5050"
    @State private var locationMessage = "Ready to locate items."
    @State private var isFetching = false
    @State private var selectedTab: AppTab = .items
    @State private var lastSeenDates: [String: Date] = [:]
    @State private var activityLog: [ActivityEvent] = []
    private let synthesizer = AVSpeechSynthesizer()

    private let buttonConfigs: [ButtonConfig] = [
        ButtonConfig(
            label: "Where are my Keys?",
            displayName: "Keys",
            key: "keys",
            symbol: "key.horizontal.fill",
            fallbackLocation: "Kitchen"
        ),
        ButtonConfig(
            label: "Where is my Wallet?",
            displayName: "Wallet",
            key: "wallet",
            symbol: "wallet.pass.fill",
            fallbackLocation: "Living Room"
        ),
        ButtonConfig(
            label: "Where are my Glasses?",
            displayName: "Glasses",
            key: "glasses",
            symbol: "eyeglasses",
            fallbackLocation: "Bedroom"
        ),
        ButtonConfig(
            label: "Where is my Phone?",
            displayName: "Phone",
            key: "phone",
            symbol: "iphone",
            fallbackLocation: "Hallway"
        )
    ]

    private var endpoint: String {
        "\(apiBaseURL.trimmingCharacters(in: .whitespacesAndNewlines))/api/objects"
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            LinearGradient(
                colors: [
                    Color(red: 0.13, green: 0.20, blue: 0.25),
                    Color(red: 0.10, green: 0.16, blue: 0.21)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            currentPage
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)

            BottomNavigationBar(selectedTab: $selectedTab)
        }
        .ignoresSafeArea()
    }

    @ViewBuilder
    private var currentPage: some View {
        switch selectedTab {
        case .home:
            homePage
        case .ask:
            askPage
        case .items:
            itemsPage
        case .activity:
            activityPage
        case .system:
            systemPage
        }
    }

    private var homePage: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                PageHeader(
                    eyebrow: "Memento",
                    title: "Room Awareness",
                    subtitle: "Quick actions for your most important items."
                )

                Button {
                    Task { await refreshAllItems() }
                } label: {
                    HighlightCard(
                        title: isFetching ? "Scanning the room..." : "Locate all tracked items",
                        detail: "Refresh item positions and speak the latest result aloud.",
                        symbol: "dot.radiowaves.left.and.right",
                        isBusy: isFetching
                    )
                }
                .buttonStyle(.plain)
                .disabled(isFetching)

                HStack(spacing: 12) {
                    SummaryCard(title: "Tracked", value: "\(buttonConfigs.count)", symbol: "square.stack.3d.up.fill")
                    SummaryCard(title: "Visible", value: "\(visibleItemCount)", symbol: "eye.fill")
                }

                HStack(spacing: 12) {
                    SummaryCard(title: "Activity", value: "\(activityLog.count)", symbol: "waveform.path.ecg")
                    SummaryCard(title: "Endpoint", value: locationManager.lastErrorMessage == nil ? "Online" : "Check", symbol: "network")
                }

                MessagePanel(title: "Latest update", message: locationMessage)
            }
            .padding(.horizontal, 18)
            .padding(.top, 18)
            .padding(.bottom, 120)
        }
    }

    private var askPage: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                PageHeader(
                    eyebrow: "Ask",
                    title: "Speak Through Touch",
                    subtitle: "Each prompt triggers a lookup and spoken response."
                )

                VStack(spacing: 12) {
                    ForEach(buttonConfigs) { config in
                        Button {
                            Task { await fetchAndHandle(for: config.key) }
                        } label: {
                            PromptCard(config: config, status: itemStatus(for: config))
                        }
                        .buttonStyle(.plain)
                        .disabled(isFetching)
                    }
                }

                MessagePanel(title: "Voice feedback", message: locationMessage)
            }
            .padding(.horizontal, 18)
            .padding(.top, 18)
            .padding(.bottom, 120)
        }
    }

    private var itemsPage: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                PageHeader(
                    eyebrow: "Accessible",
                    title: "Tracked Items List",
                    subtitle: "High-contrast cards show the most recent location state."
                )

                VStack(spacing: 12) {
                    ForEach(buttonConfigs) { config in
                        Button {
                            Task { await fetchAndHandle(for: config.key) }
                        } label: {
                            ItemCard(
                                config: config,
                                status: itemStatus(for: config),
                                isBusy: isFetching,
                                lastSeenDate: lastSeenDates[config.key]
                            )
                        }
                        .buttonStyle(.plain)
                        .disabled(isFetching)
                        .accessibilityLabel(config.label)
                        .accessibilityHint("Fetches location and reads it aloud.")
                    }
                }

                if let lastErrorMessage = locationManager.lastErrorMessage {
                    ErrorPanel(message: lastErrorMessage)
                }

                MessagePanel(title: "Latest update", message: locationMessage)
            }
            .padding(.horizontal, 18)
            .padding(.top, 18)
            .padding(.bottom, 120)
        }
    }

    private var activityPage: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                PageHeader(
                    eyebrow: "Activity",
                    title: "Recent Lookups",
                    subtitle: "A running log of refreshes and spoken results."
                )

                if activityLog.isEmpty {
                    EmptyStateCard(
                        title: "No activity yet",
                        detail: "Look up an item from Ask or Items to populate this timeline.",
                        symbol: "clock.arrow.circlepath"
                    )
                } else {
                    VStack(spacing: 12) {
                        ForEach(activityLog) { entry in
                            ActivityRow(entry: entry)
                        }
                    }
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 18)
            .padding(.bottom, 120)
        }
    }

    private var systemPage: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                PageHeader(
                    eyebrow: "System",
                    title: "Endpoint + Status",
                    subtitle: "Configure the API source and trigger a full refresh."
                )

                VStack(alignment: .leading, spacing: 12) {
                    Text("API URL")
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .foregroundStyle(Color(red: 0.46, green: 0.94, blue: 0.72))

                    HStack(spacing: 10) {
                        Image(systemName: "network")
                            .foregroundStyle(.white.opacity(0.72))

                        TextField("API URL", text: $apiBaseURL)
                            .font(.system(size: 15, weight: .medium, design: .rounded))
                            .foregroundStyle(.white)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.URL)
                            .autocorrectionDisabled()
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 14)
                    .background(panelBackground)
                }

                Button {
                    Task { await refreshAllItems() }
                } label: {
                    HighlightCard(
                        title: isFetching ? "Refreshing connection..." : "Refresh system state",
                        detail: "Queries the endpoint and updates every page with the latest item data.",
                        symbol: "arrow.clockwise.circle.fill",
                        isBusy: isFetching
                    )
                }
                .buttonStyle(.plain)
                .disabled(isFetching)

                VStack(spacing: 12) {
                    StatusRow(title: "Objects detected", value: "\(locationManager.locations.count)")
                    StatusRow(title: "Saved endpoint", value: endpoint)
                    StatusRow(title: "Voice output", value: synthesizer.isSpeaking ? "Speaking" : "Ready")
                }

                if let lastErrorMessage = locationManager.lastErrorMessage {
                    ErrorPanel(message: lastErrorMessage)
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 18)
            .padding(.bottom, 120)
        }
    }

    // Core Logic
    private func fetchAndHandle(for itemKey: String) async {
        isFetching = true
        defer { isFetching = false }
        await locationManager.fetchLocations(from: endpoint)
        lastSeenDates[itemKey] = Date()
        handleLookup(for: itemKey)
    }

    private func refreshAllItems() async {
        isFetching = true
        defer { isFetching = false }
        await locationManager.fetchLocations(from: endpoint)
        let now = Date()
        for config in buttonConfigs {
            if locationManager.locations[config.key] != nil {
                lastSeenDates[config.key] = now
            }
        }

        let refreshedCount = locationManager.locations.keys.filter { key in
            buttonConfigs.contains { $0.key == key }
        }.count

        let message = refreshedCount > 0
            ? "Updated \(refreshedCount) tracked item locations."
            : "No tracked items were returned by the endpoint."

        locationMessage = message
        logActivity(title: "System refresh", detail: message, symbol: "arrow.clockwise.circle.fill")
    }

    private func handleLookup(for itemKey: String) {
        let feedback = UINotificationFeedbackGenerator()
        feedback.prepare()

        guard let info = locationManager.locations[itemKey] else {
            feedback.notificationOccurred(.error)
            let failMessage = "Could not find your \(itemKey) in the room."
            locationMessage = failMessage
            logActivity(title: itemDisplayName(for: itemKey), detail: failMessage, symbol: "exclamationmark.circle.fill")
            speak(failMessage)
            return
        }

        let message = "Your \(itemKey) are in the \(info.location.replacingOccurrences(of: "_", with: " "))."
        locationMessage = message
        feedback.notificationOccurred(.success)
        logActivity(title: itemDisplayName(for: itemKey), detail: message, symbol: "checkmark.circle.fill")
        speak(message)
    }

    private func itemStatus(for config: ButtonConfig) -> ItemStatus {
        guard let trackedObject = locationManager.locations[config.key] else {
            return .unknown(config.fallbackLocation)
        }

        let location = trackedObject.location
            .replacingOccurrences(of: "_", with: " ")
            .split(separator: " ")
            .map { $0.capitalized }
            .joined(separator: " ")

        if let lastSeenDate = lastSeenDates[config.key],
           Date().timeIntervalSince(lastSeenDate) < 90 {
            return .visibleNow(location)
        }

        return .lastSeen(location)
    }

    private var visibleItemCount: Int {
        buttonConfigs.filter { config in
            if case .visibleNow = itemStatus(for: config) {
                return true
            }
            return false
        }.count
    }

    private func itemDisplayName(for itemKey: String) -> String {
        buttonConfigs.first(where: { $0.key == itemKey })?.displayName ?? itemKey.capitalized
    }

    private func logActivity(title: String, detail: String, symbol: String) {
        activityLog.insert(
            ActivityEvent(title: title, detail: detail, symbol: symbol, timestamp: Date()),
            at: 0
        )
    }

    private var panelBackground: some View {
        RoundedRectangle(cornerRadius: 18, style: .continuous)
            .fill(Color.white.opacity(0.08))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
            )
    }

    // Polished TTS
    private func speak(_ text: String) {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        let utterance = AVSpeechUtterance(string: text)
        // Ensure high-quality native voice
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        // Slightly slower rate for cognitive accessibility
        utterance.rate = 0.45
        // Slight pitch adjustment to sound more natural
        utterance.pitchMultiplier = 1.1
        // Pause briefly before speaking to let the haptic buzz finish
        utterance.preUtteranceDelay = 0.2
        
        synthesizer.speak(utterance)
    }
}

private struct ActivityEvent: Identifiable {
    let id = UUID()
    let title: String
    let detail: String
    let symbol: String
    let timestamp: Date
}

private enum AppTab: String, CaseIterable, Identifiable {
    case home
    case ask
    case items
    case activity
    case system

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home: "Home"
        case .ask: "Ask"
        case .items: "Items"
        case .activity: "Activity"
        case .system: "System"
        }
    }

    var symbol: String {
        switch self {
        case .home: "house"
        case .ask: "questionmark.circle"
        case .items: "archivebox.fill"
        case .activity: "waveform.path.ecg"
        case .system: "gearshape"
        }
    }
}

private enum ItemStatus {
    case visibleNow(String)
    case lastSeen(String)
    case unknown(String)

    var locationText: String {
        switch self {
        case .visibleNow(let location), .lastSeen(let location), .unknown(let location):
            location
        }
    }

    var headline: String {
        switch self {
        case .visibleNow:
            "Visible Now"
        case .lastSeen:
            "Last Seen"
        case .unknown:
            "Tap to Locate"
        }
    }

    var symbol: String {
        switch self {
        case .visibleNow:
            "eye.fill"
        case .lastSeen:
            "clock"
        case .unknown:
            "dot.radiowaves.left.and.right"
        }
    }

    var detailTint: Color {
        switch self {
        case .unknown:
            .white.opacity(0.72)
        case .visibleNow, .lastSeen:
            .white.opacity(0.82)
        }
    }
}

private struct ItemCard: View {
    let config: ButtonConfig
    let status: ItemStatus
    let isBusy: Bool
    let lastSeenDate: Date?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 12) {
                Image(systemName: config.symbol)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(Color(red: 0.50, green: 0.93, blue: 0.74))
                    .frame(width: 30)

                Text(config.displayName)
                    .font(.system(size: 23, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Spacer()
            }

            HStack(spacing: 8) {
                if isBusy {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(.black.opacity(0.82))
                } else {
                    Image(systemName: status.symbol)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(.black.opacity(0.82))
                }

                Text(isBusy ? "Locating..." : status.headline)
                    .font(.system(size: 18, weight: .heavy, design: .rounded))
                    .foregroundStyle(.black.opacity(0.88))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                LinearGradient(
                    colors: [
                        Color(red: 0.41, green: 0.92, blue: 0.79),
                        Color(red: 0.50, green: 0.95, blue: 0.66)
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(Capsule())

            Text("\(status.locationText) • \(detailText)")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(status.detailTint)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color(red: 0.20, green: 0.29, blue: 0.34).opacity(0.96))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.white.opacity(0.05), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.14), radius: 18, x: 0, y: 10)
    }

    private var detailText: String {
        guard let lastSeenDate else {
            return status.headline == "Visible Now" ? "Just now" : "Tap to refresh"
        }

        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: lastSeenDate, relativeTo: Date())
    }
}

private struct BottomNavigationBar: View {
    @Binding var selectedTab: AppTab

    var body: some View {
        HStack {
            ForEach(AppTab.allCases) { tab in
                Button {
                    selectedTab = tab
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: tab.symbol)
                            .font(.system(size: 22, weight: .semibold))
                        Text(tab.title)
                            .font(.system(size: 12, weight: .medium, design: .rounded))
                    }
                    .foregroundStyle(tab == selectedTab ? Color(red: 0.46, green: 0.94, blue: 0.72) : .white.opacity(0.48))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .overlay(alignment: .top) {
                        Capsule()
                            .fill(Color(red: 0.46, green: 0.94, blue: 0.72))
                            .frame(width: 48, height: 3)
                            .opacity(tab == selectedTab ? 1 : 0)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 12)
        .padding(.top, 10)
        .padding(.bottom, 18)
        .background(Color(red: 0.12, green: 0.18, blue: 0.22).opacity(0.98))
        .overlay(alignment: .top) {
            Rectangle()
                .fill(Color.white.opacity(0.06))
                .frame(height: 1)
        }
    }
}

private struct PageHeader: View {
    let eyebrow: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(eyebrow.uppercased())
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundStyle(.white.opacity(0.58))

            Text(title)
                .font(.system(size: 30, weight: .heavy, design: .rounded))
                .foregroundStyle(Color(red: 0.46, green: 0.94, blue: 0.72))

            Text(subtitle)
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.72))
        }
    }
}

private struct HighlightCard: View {
    let title: String
    let detail: String
    let symbol: String
    let isBusy: Bool

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.black.opacity(0.18))
                    .frame(width: 52, height: 52)

                if isBusy {
                    ProgressView()
                        .tint(.white)
                } else {
                    Image(systemName: symbol)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(.white)
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.system(size: 20, weight: .heavy, design: .rounded))
                    .foregroundStyle(.black.opacity(0.82))

                Text(detail)
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundStyle(.black.opacity(0.68))
            }

            Spacer()
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.41, green: 0.92, blue: 0.79),
                    Color(red: 0.50, green: 0.95, blue: 0.66)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

private struct SummaryCard: View {
    let title: String
    let value: String
    let symbol: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: symbol)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(Color(red: 0.46, green: 0.94, blue: 0.72))

            Text(value)
                .font(.system(size: 26, weight: .heavy, design: .rounded))
                .foregroundStyle(.white)

            Text(title)
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.62))
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color(red: 0.20, green: 0.29, blue: 0.34).opacity(0.96))
        )
    }
}

private struct MessagePanel: View {
    let title: String
    let message: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundStyle(Color(red: 0.46, green: 0.94, blue: 0.72))

            Text(message)
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundStyle(.white.opacity(0.86))
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.white.opacity(0.07))
        )
    }
}

private struct ErrorPanel: View {
    let message: String

    var body: some View {
        Text(message)
            .font(.system(size: 14, weight: .semibold, design: .rounded))
            .foregroundStyle(Color(red: 1.0, green: 0.57, blue: 0.57))
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(Color(red: 0.32, green: 0.16, blue: 0.18).opacity(0.9))
            )
    }
}

private struct PromptCard: View {
    let config: ButtonConfig
    let status: ItemStatus

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: config.symbol)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(Color(red: 0.46, green: 0.94, blue: 0.72))
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 4) {
                Text(config.label)
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text(status.locationText)
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.6))
            }

            Spacer()

            Image(systemName: "arrow.up.left.and.arrow.down.right.circle.fill")
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(.white.opacity(0.5))
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color(red: 0.20, green: 0.29, blue: 0.34).opacity(0.96))
        )
    }
}

private struct EmptyStateCard: View {
    let title: String
    let detail: String
    let symbol: String

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 28, weight: .bold))
                .foregroundStyle(Color(red: 0.46, green: 0.94, blue: 0.72))

            Text(title)
                .font(.system(size: 20, weight: .heavy, design: .rounded))
                .foregroundStyle(.white)

            Text(detail)
                .font(.system(size: 14, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.68))
                .multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color(red: 0.20, green: 0.29, blue: 0.34).opacity(0.96))
        )
    }
}

private struct ActivityRow: View {
    let entry: ActivityEvent

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: entry.symbol)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(Color(red: 0.46, green: 0.94, blue: 0.72))
                .frame(width: 26)

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(entry.title)
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)

                    Spacer()

                    Text(entry.timestamp.formatted(date: .omitted, time: .shortened))
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.45))
                }

                Text(entry.detail)
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.72))
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color(red: 0.20, green: 0.29, blue: 0.34).opacity(0.96))
        )
    }
}

private struct StatusRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .foregroundStyle(.white.opacity(0.72))

            Spacer()

            Text(value)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .multilineTextAlignment(.trailing)
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color(red: 0.20, green: 0.29, blue: 0.34).opacity(0.96))
        )
    }
}
