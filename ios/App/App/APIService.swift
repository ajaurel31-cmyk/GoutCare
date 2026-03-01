import Foundation
import UIKit

// MARK: - API Service for food image analysis

class APIService {
    static let shared = APIService()

    // Backend URL — set to your deployed Next.js API
    private let baseURL = "https://goutcare.vercel.app"

    func analyzeFood(image: UIImage) async throws -> ScanResult {
        guard let imageData = image.jpegData(compressionQuality: 0.7) else {
            throw APIError.invalidImage
        }

        let base64 = imageData.base64EncodedString()
        let dataURL = "data:image/jpeg;base64,\(base64)"

        let url = URL(string: "\(baseURL)/api/analyze")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 30

        let body: [String: Any] = ["images": [dataURL]]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }

        let result = try JSONDecoder().decode(ScanResult.self, from: data)
        return result
    }
}

enum APIError: LocalizedError {
    case invalidImage
    case serverError
    case networkError

    var errorDescription: String? {
        switch self {
        case .invalidImage: return "Could not process the image."
        case .serverError: return "Server error. Please try again."
        case .networkError: return "Network error. Check your connection."
        }
    }
}
