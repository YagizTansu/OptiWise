
add_library(csv_operations CSVReaderWriter.cpp)
target_include_directories(csv_operations PUBLIC ../include)
target_link_libraries(csv_operations csv)

find_package(CURL REQUIRED)

add_library(asset Asset/Asset.cpp)
target_include_directories(asset PUBLIC ../include)

add_library(stock Asset/Stock.cpp)
target_include_directories(stock PUBLIC ../include)

add_library(AlphaVantageAPI AlphaVantageAdapter/AlphaVantageAPI.cpp)
target_include_directories(AlphaVantageAPI PUBLIC ../include)
target_link_libraries(AlphaVantageAPI CURL::libcurl asset stock)


# require at least c++17
target_compile_features(csv_operations PUBLIC cxx_std_17)
