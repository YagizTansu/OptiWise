#ifndef ICSVREADERWRITER_HPP
#define ICSVREADERWRITER_HPP

#include <string>
#include <vector>

class ICSVReaderWriter
{
public:
    virtual ~ICSVReaderWriter() = default;
    virtual void read(const std::string &file_path) = 0;
    virtual void addRow(std::vector<std::vector<std::string>>& data, const std::vector<std::string>& new_row) = 0;
    virtual void write(const std::string& file_path, const std::vector<std::vector<std::string>>& data) = 0;
    virtual std::vector<std::vector<std::string>> addColumn(const std::string &file_path, const std::string& new_column_name, const std::vector<std::string>& new_column_data);
};

#endif
