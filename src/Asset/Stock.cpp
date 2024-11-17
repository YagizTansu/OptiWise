#include "Asset/Stock.hpp"

// Constructor implementation
Stock::Stock(const std::string &name, const std::string &tickerSymbol)
    : Asset(name, tickerSymbol) {}

// Override the display function
void Stock::display() const {
    std::cout << "Stock: " << this->getName() << " (" << this->getSymbol() << ")" << std::endl;
}
