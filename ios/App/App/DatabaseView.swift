import SwiftUI

struct DatabaseView: View {
    @State private var search = ""
    @State private var selectedCategory: PurineCategory?
    @State private var expandedId: String?

    private var filtered: [FoodItem] {
        var items = purineDatabase
        if let cat = selectedCategory {
            items = items.filter { $0.category == cat }
        }
        if !search.isEmpty {
            items = items.filter { $0.name.localizedCaseInsensitiveContains(search) }
        }
        return items
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: 12) {
                Text("Food Database")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(GC.text)
                    .frame(maxWidth: .infinity, alignment: .leading)

                // Search
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(GC.textTertiary)
                    TextField("Search \(purineDatabase.count) foods...", text: $search)
                        .foregroundColor(GC.text)
                }
                .padding(12)
                .background(GC.bgInput)
                .cornerRadius(10)

                // Category pills
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        CategoryPill(label: "All", isSelected: selectedCategory == nil) {
                            selectedCategory = nil
                        }
                        ForEach(PurineCategory.allCases, id: \.self) { cat in
                            CategoryPill(label: cat.rawValue, isSelected: selectedCategory == cat) {
                                selectedCategory = cat
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 12)

            // Food list
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(filtered) { food in
                        FoodRow(food: food, isExpanded: expandedId == food.id) {
                            withAnimation(.spring(response: 0.3)) {
                                expandedId = expandedId == food.id ? nil : food.id
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 120)
            }

            // Purine legend at bottom is inside scroll
        }
        .background(GC.bg.ignoresSafeArea())
    }
}

// MARK: - Category Pill
struct CategoryPill: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(isSelected ? .white : GC.textSecondary)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? GC.accent : GC.bgCard)
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(isSelected ? Color.clear : GC.border, lineWidth: 1)
                )
        }
    }
}

// MARK: - Food Row
struct FoodRow: View {
    let food: FoodItem
    let isExpanded: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: isExpanded ? 12 : 0) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(food.name)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(GC.text)
                        Text(food.servingSize)
                            .font(.system(size: 12))
                            .foregroundColor(GC.textTertiary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        PurineBadge(level: food.purineLevel, mg: food.purineContent)
                        Text(food.purineLevel.label)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(GC.purineColor(food.purineLevel))
                    }
                }

                if isExpanded {
                    if let desc = food.description {
                        Text(desc)
                            .font(.system(size: 13))
                            .foregroundColor(GC.textSecondary)
                            .lineSpacing(2)
                    }

                    if let warnings = food.warnings, !warnings.isEmpty {
                        ForEach(warnings, id: \.self) { warning in
                            HStack(spacing: 6) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .font(.system(size: 11))
                                    .foregroundColor(GC.warning)
                                Text(warning)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(GC.warning)
                            }
                        }
                    }
                }
            }
            .padding(14)
            .background(GC.bgCard)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}
