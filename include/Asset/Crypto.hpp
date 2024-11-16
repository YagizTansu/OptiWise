
#ifndef CRYPTO_HPP
#define CRYPTO_HPP

#include "Asset.hpp"

class Crypto : public Asset
{
private:

public:
    Crypto(const std::string &name, const std::string &tickerSymbol)
        : Asset(name, tickerSymbol) {}

    void display() const override
    {
        std::cout << "Stock: " << name << " (" << tickerSymbol << ")" << std::endl;
    }
};

#endif