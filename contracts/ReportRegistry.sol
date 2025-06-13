// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReportRegistry {
    struct Report {
        address reporter;
        string cid;
        uint256 timestamp;
    }

    Report[] public reports;

    event ReportSubmitted(address indexed reporter, string cid, uint256 timestamp);

    function submitReport(string calldata cid) external {
        reports.push(Report(msg.sender, cid, block.timestamp));
        emit ReportSubmitted(msg.sender, cid, block.timestamp);
    }

    function getReportCount() external view returns (uint256) {
        return reports.length;
    }

    function getReport(uint256 index)
        external
        view
        returns (address reporter, string memory cid, uint256 timestamp)
    {
        Report storage r = reports[index];
        return (r.reporter, r.cid, r.timestamp);
    }
}