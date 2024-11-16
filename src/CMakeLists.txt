add_library(csv_operations CSVReaderWriter.cpp)
target_include_directories(csv_operations PUBLIC ../include)
target_link_libraries(csv_operations csv)

# require at least c++17
target_compile_features(csv_operations PUBLIC cxx_std_17)
