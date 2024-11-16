#ifndef COMODOTIES_HPP
#define COMODOTIES_HPP

#include "Asset.hpp"

class Comodoties : public Asset
{
private:

public:
    Comodoties(const std::string &name, const std::string &tickerSymbol)
        : Asset(name, tickerSymbol) {}

    void display() const override
    {
        std::cout << "Stock: " << name << " (" << tickerSymbol << ")" << std::endl;
    }
};

#endif