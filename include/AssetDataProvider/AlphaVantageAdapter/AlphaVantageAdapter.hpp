#ifndef ALPHAVANTAGEADAPTER_HPP
#define ALPHAVANTAGEADAPTER_HPP

#include "Asset/Asset.hpp"
#include "AssetDataProvider/AssetDataProvider.hpp"
#include "AlphaVantageAPI.hpp"

class AlphaVantageAdapter : public AssetDataProvider {
private:
    AlphaVantageAPI alphaVantageAPI;

public:
    double getHistoricalData(Asset& asset) override {
        // AlphaVantageAPI'nin fonksiyonunu çağırıp uyumlu veri tipine dönüştürürüz.
        return alphaVantageAPI.fetchHistoricalDataFromAlphaVantage(asset);
    }
};

#endif
