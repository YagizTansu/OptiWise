#include "AssetDataProvider/AlphaVantageAdapter/AlphaVantageAdapter.hpp"
#include "csv_operations/CSVReaderWriter.hpp"
#include "Asset/Asset.hpp"
#include "Asset/Stock.hpp"
#include <iostream>

int main()
{
    std::cout << "Financial Adviser Project" << std::endl;

    Stock stock("IBM","IBM");

    AlphaVantageAdapter alphaVantageAdapter;
    std::string data = alphaVantageAdapter.getHistoricalData(stock);
    std::cout << data << std::endl;
    return 0;
}