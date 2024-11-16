// include/CSVReaderWriter.hpp
#ifndef CSVREADERWRITER_HPP
#define CSVREADERWRITER_HPP

#include "ICSVReaderWriter.hpp"
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include "csv.hpp"

#pragma once

class CSVReaderWriter : public ICSVReaderWriter
{
private:
    std::string filename;

public:
    // Constructor ve Destructor
    CSVReaderWriter();
    CSVReaderWriter(std::string filename);
    ~CSVReaderWriter();

    // CSV işlemleri
    void read(const std::string &file_path) override;
    void addRow(std::vector<std::vector<std::string>> &data, const std::vector<std::string> &new_row) = 0;
    void write(const std::string &file_path, const std::vector<std::vector<std::string>> &data) = 0;
    std::vector<std::vector<std::string>> addColumn(const std::string &file_path, const std::string &new_column_name, const std::vector<std::string> &new_column_data) = 0;

private:
};

#endif // CSVREADERWRITER_HPP
