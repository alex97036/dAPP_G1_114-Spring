// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReportRegistry {
    struct Report {
        uint256 reportId;           // 檢舉識別碼（全局唯一）
        address reporter;           // 檢舉人錢包地址
        string cid;                // IPFS 內容識別碼
        uint256 timestamp;         // 檢舉時間戳
        string reporterCommitment; // ZKP 匿名身分標識
        string nullifierHash;      // ZKP 檢舉識別碼（防重複）
        bool zkpVerified;          // ZKP 驗證狀態
    }

    // 全局檢舉記錄陣列（支援多筆記錄）
    Report[] public reports;
    
    // 檢舉計數器
    uint256 private reportCounter;
    
    // 每個檢舉人的檢舉記錄索引
    mapping(address => uint256[]) public reporterToReports;
    
    // 檢舉識別碼到報告索引的映射（快速查找）
    mapping(uint256 => uint256) public reportIdToIndex;
    
    // Nullifier Hash 防重複檢查
    mapping(string => bool) public usedNullifiers;

    // 事件定義
    event ReportSubmitted(
        uint256 indexed reportId,
        address indexed reporter,
        string cid,
        uint256 timestamp,
        string reporterCommitment,
        string nullifierHash,
        bool zkpVerified
    );

    // 提交檢舉（基本版本 - 向後相容）
    function submitReport(string calldata cid) external {
        _submitReportWithZKP(cid, "", "", false);
    }

    // 提交檢舉（ZKP 增強版本）
    function submitReportWithZKP(
        string calldata cid,
        string calldata reporterCommitment,
        string calldata nullifierHash,
        bool zkpVerified
    ) external {
        _submitReportWithZKP(cid, reporterCommitment, nullifierHash, zkpVerified);
    }

    // 內部提交邏輯
    function _submitReportWithZKP(
        string calldata cid,
        string memory reporterCommitment,
        string memory nullifierHash,
        bool zkpVerified
    ) internal {
        // 如果是 ZKP 檢舉，檢查 nullifier 是否已使用
        if (zkpVerified && bytes(nullifierHash).length > 0) {
            require(!usedNullifiers[nullifierHash], "Nullifier already used");
            usedNullifiers[nullifierHash] = true;
        }

        // 生成新的檢舉識別碼
        reportCounter++;
        uint256 newReportId = reportCounter;

        // 創建檢舉記錄
        Report memory newReport = Report({
            reportId: newReportId,
            reporter: msg.sender,
            cid: cid,
            timestamp: block.timestamp,
            reporterCommitment: reporterCommitment,
            nullifierHash: nullifierHash,
            zkpVerified: zkpVerified
        });

        // 添加到全局記錄
        reports.push(newReport);
        uint256 reportIndex = reports.length - 1;

        // 更新檢舉人的記錄索引
        reporterToReports[msg.sender].push(reportIndex);

        // 更新檢舉ID到索引的映射
        reportIdToIndex[newReportId] = reportIndex;

        // 發出事件
        emit ReportSubmitted(
            newReportId,
            msg.sender,
            cid,
            block.timestamp,
            reporterCommitment,
            nullifierHash,
            zkpVerified
        );
    }

    // 獲取檢舉總數
    function getReportCount() external view returns (uint256) {
        return reports.length;
    }

    // 獲取特定檢舉記錄（通過索引）
    function getReport(uint256 index)
        external
        view
        returns (
            uint256 reportId,
            address reporter,
            string memory cid,
            uint256 timestamp,
            string memory reporterCommitment,
            string memory nullifierHash,
            bool zkpVerified
        )
    {
        require(index < reports.length, "Report index out of bounds");
        Report storage r = reports[index];
        return (
            r.reportId,
            r.reporter,
            r.cid,
            r.timestamp,
            r.reporterCommitment,
            r.nullifierHash,
            r.zkpVerified
        );
    }

    // 獲取特定檢舉記錄（通過檢舉ID）
    function getReportById(uint256 reportId)
        external
        view
        returns (
            uint256 id,
            address reporter,
            string memory cid,
            uint256 timestamp,
            string memory reporterCommitment,
            string memory nullifierHash,
            bool zkpVerified
        )
    {
        uint256 index = reportIdToIndex[reportId];
        require(index < reports.length && reports[index].reportId == reportId, "Report not found");
        
        Report storage r = reports[index];
        return (
            r.reportId,
            r.reporter,
            r.cid,
            r.timestamp,
            r.reporterCommitment,
            r.nullifierHash,
            r.zkpVerified
        );
    }

    // 獲取特定檢舉人的所有檢舉記錄數量
    function getReporterReportCount(address reporter) external view returns (uint256) {
        return reporterToReports[reporter].length;
    }

    // 獲取特定檢舉人的檢舉記錄（分頁）
    function getReporterReports(address reporter, uint256 offset, uint256 limit)
        external
        view
        returns (
            uint256[] memory reportIds,
            string[] memory cids,
            uint256[] memory timestamps,
            string[] memory commitments,
            string[] memory nullifiers,
            bool[] memory zkpStatuses
        )
    {
        uint256[] storage reportIndices = reporterToReports[reporter];
        uint256 totalReports = reportIndices.length;
        
        require(offset < totalReports, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > totalReports) {
            end = totalReports;
        }
        
        uint256 resultLength = end - offset;
        
        reportIds = new uint256[](resultLength);
        cids = new string[](resultLength);
        timestamps = new uint256[](resultLength);
        commitments = new string[](resultLength);
        nullifiers = new string[](resultLength);
        zkpStatuses = new bool[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            uint256 reportIndex = reportIndices[offset + i];
            Report storage r = reports[reportIndex];
            
            reportIds[i] = r.reportId;
            cids[i] = r.cid;
            timestamps[i] = r.timestamp;
            commitments[i] = r.reporterCommitment;
            nullifiers[i] = r.nullifierHash;
            zkpStatuses[i] = r.zkpVerified;
        }
        
        return (reportIds, cids, timestamps, commitments, nullifiers, zkpStatuses);
    }

    // 檢查 Nullifier 是否已被使用
    function isNullifierUsed(string calldata nullifierHash) external view returns (bool) {
        return usedNullifiers[nullifierHash];
    }

    // 獲取當前檢舉計數器
    function getCurrentReportId() external view returns (uint256) {
        return reportCounter;
    }
}