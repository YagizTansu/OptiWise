#ifndef ASSET_HPP
#define ASSET_HPP

#include <string>
#include <iostream>

class Asset
{
protected:
    /* data */
    std::string name;
    std::string symbol;

public:
    Asset(const std::string &name, const std::string &symbol) : name(name), symbol(symbol) {}
    ~Asset()
    {
    }

    std::string getName() const
    {
        return name;
    }

    std::string getSymbol() const
    {
        return name;
    }

    // Virtual function to display asset information (can be overridden)
    virtual void display() const
    {
        std::cout << "Asset: " << name << ", Price: " << symbol << std::endl;
    }
};

#endif
