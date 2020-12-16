pragma solidity ^0.4.0;
contract KVStore {
    mapping(uint64 => string) public map;
    
    function set(uint64 key, string value) public {
        map[key] = value;
    }
    
    function get(uint64 key) public view returns (string) {
        return map[key];
    }
}

