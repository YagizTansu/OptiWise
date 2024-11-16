#include "csv_operations/CSVReaderWriter.hpp"
#include <sstream>
#include <iostream>

// Constructor
CSVReaderWriter::CSVReaderWriter()
{
}

CSVReaderWriter::CSVReaderWriter(std::string file_name) : filename(file_name)
{
}

// Destructor
CSVReaderWriter::~CSVReaderWriter()
{
}

void CSVReaderWriter::read(const std::string &file_path)
{
    csv::CSVReader reader(file_path);

    for (csv::CSVRow &row : reader)
    {
        for (csv::CSVField &field : row)
        {
            std::cout << field.get<>() << " ";
        }
        std::cout << std::endl;
    }
}

void CSVReaderWriter::addRow(std::vector<std::vector<std::string>> &data, const std::vector<std::string> &new_row)
{
    data.push_back(new_row);
}

void CSVReaderWriter::write(const std::string &file_path, const std::vector<std::vector<std::string>> &data)
{
    // stringstream ss; // Can also use ofstream, etc.

    // auto writer = csv::make_csv_writer(ss);

    // for (const auto &row : data)
    // {
    //     writer << row;
    // }
}

std::vector<std::vector<std::string>> CSVReaderWriter::addColumn(const std::string &file_path, const std::string &new_column_name, const std::vector<std::string> &new_column_data)
{
    csv::CSVReader reader(file_path);

    std::vector<std::vector<std::string>> data;
    bool header_added = false;
    size_t row_index = 0;

    for (csv::CSVRow &row : reader)
    {
        std::vector<std::string> row_data;

        // Handle header row if not already added
        if (!header_added)
        {
            for (csv::CSVField &field : row)
            {
                row_data.push_back(field.get<>());
            }
            row_data.push_back(new_column_name); // Add new column header
            data.push_back(row_data);
            row_data.clear();
            header_added = true;
        }

        // Add existing data from the row
        for (csv::CSVField &field : row)
        {
            row_data.push_back(field.get<>());
        }

        // Add corresponding value from new column data if available
        if (row_index < new_column_data.size())
        {
            row_data.push_back(new_column_data[row_index]);
        }
        else
        {
            // Add an empty string if there is no corresponding data for the row
            row_data.push_back("");
        }

        data.push_back(row_data);
        row_index++;
    }

    return data;
}