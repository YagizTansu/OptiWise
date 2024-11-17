#ifndef ASSET_HPP
#define ASSET_HPP

#include <string>
#include <iostream>

class Asset
{
protected:
    std::string name;
    std::string symbol;

public:
    // Constructor
    Asset(const std::string &name, const std::string &symbol);

    // Destructor
    virtual ~Asset();

    // Getters
    std::string getName() const;
    std::string getSymbol() const;

    // Virtual function to display asset information
    virtual void display() const;
};

#endif
