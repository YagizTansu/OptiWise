add_executable(main main.cpp)
target_link_libraries(main PRIVATE csv_operations asset stock AlphaVantageAPI)
