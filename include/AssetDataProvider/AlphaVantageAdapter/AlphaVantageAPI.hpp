#ifndef ALPHAVANTAGEAPI_HPP
#define ALPHAVANTAGEAPI_HPP

#include "Asset/Asset.hpp"

class AlphaVantageAPI
{
public:
    double fetchHistoricalDataFromAlphaVantage(Asset& asset)
    {

        std::cout << "Fetching data from Alpha Vantage API for " << asset.getSymbol() << "...\n";
        return 150.5; // Örnek olarak sabit bir fiyat dönüyoruz
    }
};
#endif
