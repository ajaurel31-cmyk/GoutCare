import Foundation
import UIKit

// MARK: - API Service for food image analysis

class APIService {
    static let shared = APIService()

    // Backend URL — set to your deployed Next.js API
    private let baseURL = "https://www.goutcare.app"

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
        request.timeoutInterval = 60

        let body: [String: Any] = ["images": [dataURL]]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError
        }

        guard httpResponse.statusCode == 200 else {
            // Try to extract error message from the server response
            if let errorBody = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let message = errorBody["error"] as? String {
                throw APIError.serverErrorWithMessage(message)
            }
            throw APIError.serverError(statusCode: httpResponse.statusCode)
        }

        let result = try JSONDecoder().decode(ScanResult.self, from: data)
        return result
    }
}

enum APIError: LocalizedError {
    case invalidImage
    case serverError(statusCode: Int)
    case serverErrorWithMessage(String)
    case networkError

    var errorDescription: String? {
        switch self {
        case .invalidImage: return "Could not process the image."
        case .serverError(let code): return "Server error (\(code)). Please try again."
        case .serverErrorWithMessage(let msg): return msg
        case .networkError: return "Network error. Check your connection."
        }
    }
}
