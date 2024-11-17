#include "AssetDataProvider/AlphaVantageAdapter/AlphaVantageAPI.hpp"
#include <curl/curl.h>
#include <iostream>
#include <filesystem>

using json = nlohmann::json;

// Constructor: API anahtarını başlatır
AlphaVantageAPI::AlphaVantageAPI()
{

    loadEnvFile("/home/yagiz/Desktop/OptiWise/.env");

    // Access the environment variable
    const char *api_key = std::getenv("ALPHA_VANTAGE_API_KEY");
    if (api_key)
    {
        this->apiKey = std::string(api_key);
    }
    else
    {
        std::cout << "API Key not found.\n";
    }
}

// API URL'sini oluşturur
std::string AlphaVantageAPI::buildUrl(const std::string &symbol)
{
    const std::string baseUrl = "https://www.alphavantage.co/query?";
    return baseUrl + "function=TIME_SERIES_DAILY&symbol=" + symbol + "&apikey=" + apiKey;
}

// Veriyi almak için kullanılan callback fonksiyonu
size_t AlphaVantageAPI::WriteCallback(void *contents, size_t size, size_t nmemb, void *userp)
{
    ((std::string *)userp)->append((char *)contents, size * nmemb);
    return size * nmemb;
}

// Hisse senedi verilerini çeker
std::string AlphaVantageAPI::fetchHistoricalDataFromAlphaVantage(Asset &asset)
{
    CURL *curl;
    CURLcode res;
    std::string readBuffer;

    // API URL'sini oluştur
    std::string url = buildUrl(asset.getSymbol());

    // libcurl başlat
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    if (curl)
    {
        // URL'yi ayarla
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());

        // Veriyi almak için callback fonksiyonunu ayarla
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);

        // HTTP isteği gönder
        res = curl_easy_perform(curl);

        // İstek başarılı ise
        if (res != CURLE_OK)
        {
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
        }

        // Temizlik işlemleri
        curl_easy_cleanup(curl);
    }

    curl_global_cleanup();

    return readBuffer;
}

#include <iostream>
#include <fstream>
#include <string>
#include <cstdlib>
#include <sstream>

void AlphaVantageAPI::loadEnvFile(const std::string &filename)
{
    std::ifstream file(filename);
    if (!file.is_open())
    {
        std::cerr << "Could not open the .env file.\n";
        return;
    }

    std::string line;
    while (std::getline(file, line))
    {
        // Skip empty lines and comments
        if (line.empty() || line[0] == '#')
        {
            continue;
        }

        std::istringstream ss(line);
        std::string key;
        if (std::getline(ss, key, '='))
        {
            std::string value;
            if (std::getline(ss, value))
            {
                // Remove any potential whitespace around the key or value
                key.erase(0, key.find_first_not_of(" \t\n\r"));
                key.erase(key.find_last_not_of(" \t\n\r") + 1);
                value.erase(0, value.find_first_not_of(" \t\n\r"));
                value.erase(value.find_last_not_of(" \t\n\r") + 1);

                // Optionally set the environment variable (UNIX-specific)
                setenv(key.c_str(), value.c_str(), 1);
            }
        }
    }

    file.close();
}
