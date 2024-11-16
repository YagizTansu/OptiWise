#include "AssetDataProvider/AlphaVantageAdapter/AlphaVantageAdapter.hpp"
#include "csv_operations/CSVReaderWriter.hpp"
#include <iostream>
#include "Asset/Asset.hpp"
#include "Asset/Stock.hpp"

int main()
{
    std::cout << "Financial Adviser Project" << std::endl;

    std::string name{};
    Stock stock(name,name);

    AlphaVantageAdapter alphaVantageAdapter;
    double data = alphaVantageAdapter.getHistoricalData(stock);

    return 0;
}
