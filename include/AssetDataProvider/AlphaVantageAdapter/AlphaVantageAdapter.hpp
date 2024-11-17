#ifndef ALPHAVANTAGEADAPTER_HPP
#define ALPHAVANTAGEADAPTER_HPP

#include "Asset/Asset.hpp"
#include "AssetDataProvider/AssetDataProvider.hpp"
#include "AlphaVantageAPI.hpp"

class AlphaVantageAdapter : public AssetDataProvider {
private:
    AlphaVantageAPI alphaVantageAPI;

public:
    std::string getHistoricalData(Asset& asset) override {
        return alphaVantageAPI.fetchHistoricalDataFromAlphaVantage(asset);
    }
};

#endif
