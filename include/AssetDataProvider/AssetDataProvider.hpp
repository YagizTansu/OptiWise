#ifndef ASSETDATAPROVIDER_HPP
#define ASSETDATAPROVIDER_HPP

#include "Asset/Asset.hpp"

class AssetDataProvider {
public:
    virtual double getHistoricalData(Asset& asset) = 0;

    virtual ~AssetDataProvider() {}
};

#endif