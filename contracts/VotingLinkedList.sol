// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingLinkedList {
    event AddEntry(
        bytes32 head,
        bytes32 tail,
        bytes32 next,
        bytes32 prev,
        uint256 price,
        uint256 power
    );

    event UpdatePower(bytes32 id, uint256 newPower);

    uint public length = 0;

    bytes32 public head;
    bytes32 public tail;

    struct Object {
        bytes32 next;
        bytes32 prev;
        uint256 price;
        uint256 power;
    }

    mapping(bytes32 => Object) public objects;

    constructor() {}

    function addEntry(uint256 _price, uint256 _power) public returns (bytes32) {
        require(length == 0, "Use insert index instead!");

        Object memory object = Object(tail, head, _price, _power);

        bytes32 id = keccak256(
            abi.encodePacked(
                block.timestamp,
                length,
                object.power,
                object.price
            )
        );
        objects[id] = object;

        head = id;
        tail = id;

        length++;

        emit AddEntry(
            head,
            tail,
            object.next,
            object.prev,
            object.price,
            object.power
        );
        return id;
    }

    function insertAtIndex(
        bytes32 _prev,
        uint256 _price,
        uint256 _power
    ) public returns (bytes32) {
        require(
            length > 0 || _prev == 0x0,
            "LinkedList is empty, use addEntry instead"
        );

        bytes32 nextId = objects[_prev].next;

        require(
            (_power >= objects[_prev].power) || (_prev == 0x0),
            "Inserted power should be greater than or equal to the left element or inserting at the beginning"
        );
        require(
            (_power < objects[nextId].power) || (nextId == 0x0),
            "Inserted power should be less than the right element or insert at the end"
        );

        Object memory object = Object(nextId, _prev, _price, _power);

        bytes32 id = keccak256(
            abi.encodePacked(
                block.timestamp,
                length,
                object.power,
                object.price
            )
        );

        if (_prev == 0x0) {
            if (_power <= objects[head].power) {
                objects[head].prev = id;
                object.next = head;
                object.prev = 0x0;
                head = id;
            } else if (_power >= objects[tail].power) {
                objects[tail].next = id;
                object.prev = tail;
                object.next = 0x0;
                tail = id;
            } else {
                revert("Incorrect data!");
            }
        }

        objects[id] = object;

        objects[_prev].next = id;

        objects[nextId].prev = id;

        length++;

        emit AddEntry(
            head,
            tail,
            object.next,
            object.prev,
            object.price,
            object.power
        );
        return id;
    }

    function moveEntry(bytes32 _id, bytes32 _newPrev) public returns (bool) {
        require(length > 0, "LinkedList is empty");
        require(objects[_id].price > 0, "Entry not found");

        bytes32 currentPrev = objects[_id].prev;
        bytes32 currentNext = objects[_id].next;

        require(
            (_newPrev != 0x0 &&
                objects[currentPrev].power <= objects[_id].power) ||
                (_newPrev == 0x0 && currentPrev == 0x0),
            "Inserted power should be greater than or equal to the left element"
        );
        require(
            (currentNext != 0x0 &&
                objects[currentNext].power > objects[_id].power) ||
                (currentNext == 0x0 && _newPrev != 0x0),
            "Inserted power should be less than the right element"
        );

        if (_newPrev == 0x0) {
            head = _id;
        } else {
            objects[_newPrev].next = _id;
        }

        objects[_id].prev = _newPrev;

        if (currentPrev != 0x0) {
            objects[currentPrev].next = currentNext;
        } else {
            head = currentNext;
        }

        if (currentNext != 0x0) {
            objects[currentNext].prev = currentPrev;
        } else {
            tail = currentPrev;
        }

        return true;
    }

    function updatePower(bytes32 _id, uint256 _newPower) public returns (bool) {
        require(objects[_id].price > 0, "Entry not found");

        objects[_id].power = _newPower;

        emit UpdatePower(_id, _newPower);

        return true;
    }

    function getEntry(
        bytes32 _id
    ) public view returns (bytes32, bytes32, uint256, uint256) {
        return (
            objects[_id].next,
            objects[_id].prev,
            objects[_id].price,
            objects[_id].power
        );
    }

    struct EntryInfo {
        bytes32 id;
        bytes32 next;
        bytes32 prev;
        uint256 price;
        uint256 power;
    }

    function getAllEntries() public view returns (EntryInfo[] memory) {
        EntryInfo[] memory entries = new EntryInfo[](length);

        bytes32 currentId = head;
        uint256 index = 0;

        while (currentId != 0x0) {
            entries[index] = EntryInfo(
                currentId,
                objects[currentId].next,
                objects[currentId].prev,
                objects[currentId].price,
                objects[currentId].power
            );

            currentId = objects[currentId].next;
            index++;
        }

        return entries;
    }

    function resetLinkedList() external {
        length = 0;
        tail = 0;
        head = 0;
    }
}
