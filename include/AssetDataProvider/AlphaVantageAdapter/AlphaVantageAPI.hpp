#ifndef ALPHAVANTAGEAPI_HPP
#define ALPHAVANTAGEAPI_HPP

#include <string>
#include <nlohmann/json.hpp>
#include <cstdlib> // getenv()
#include "Asset/Asset.hpp"

class AlphaVantageAPI
{
public:
    // Constructor: API anahtarını alır
    AlphaVantageAPI();

    // Hisse senedi verisini çeker
    std::string fetchHistoricalDataFromAlphaVantage(Asset &asset);

private:
    // API anahtarını saklar
    std::string apiKey;

    // Alpha Vantage API URL'sini döner
    std::string buildUrl(const std::string &symbol);

    // libcurl'dan gelen veriyi işler
    static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp);

    void loadEnvFile(const std::string& filename);
};

#endif // ALPHAVANTAGEAPI_HPP