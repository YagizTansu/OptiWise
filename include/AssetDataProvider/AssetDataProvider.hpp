#ifndef ASSETDATAPROVIDER_HPP
#define ASSETDATAPROVIDER_HPP

#include "Asset/Asset.hpp"

class AssetDataProvider {
public:
    virtual std::string getHistoricalData(Asset& asset) = 0;

    virtual ~AssetDataProvider() {}
};

#endif