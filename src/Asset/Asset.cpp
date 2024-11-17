#include "Asset/Asset.hpp"

// Constructor implementation
Asset::Asset(const std::string &name, const std::string &symbol)
    : name(name), symbol(symbol) {}

// Destructor implementation
Asset::~Asset() {
    // No specific cleanup needed here, as we don't allocate dynamic memory
}

// Getter for 'name'
std::string Asset::getName() const {
    return name;
}

// Getter for 'symbol'
std::string Asset::getSymbol() const {
    return symbol;
}

// Virtual function to display asset information
void Asset::display() const {
    std::cout << "Asset: " << name << ", Price: " << symbol << std::endl;
}
