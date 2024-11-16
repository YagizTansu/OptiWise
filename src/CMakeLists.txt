
add_library(csv_operations CSVReaderWriter.cpp)
target_include_directories(csv_operations PUBLIC ../include)
target_link_libraries(csv_operations csv)

find_package(CURL REQUIRED)

# add_library(stock_data_downloads stock_data_download.cpp)
# target_include_directories(stock_data_downloads PUBLIC ../include)
# target_link_libraries(stock_data_downloads CURL::libcurl)


# require at least c++17
target_compile_features(csv_operations PUBLIC cxx_std_17)
