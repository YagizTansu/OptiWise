#ifndef STOCK_HPP
#define STOCK_HPP

#include "Asset/Asset.hpp"


class Stock : public Asset
{
private:

public:
    Stock(const std::string &name, const std::string &tickerSymbol)
        : Asset(name, tickerSymbol) {}

    void display() const override
    {
        std::cout << "Stock: " << this->getName() << " (" << this->getSymbol() << ")" << std::endl;
    }
};

#endif
