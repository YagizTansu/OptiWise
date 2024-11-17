#ifndef STOCK_HPP
#define STOCK_HPP

#include "Asset.hpp"

class Stock : public Asset
{
public:
    // Constructor that initializes the base class (Asset) with name and ticker symbol
    Stock(const std::string &name, const std::string &tickerSymbol);

    // Override the display function to provide specific behavior for Stock
    void display() const override;
};

#endif
