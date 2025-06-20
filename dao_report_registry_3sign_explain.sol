// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; 


interface IRewardToken {
    function mint(address to, uint256 amount) external;
}


contract ReportRegistry {
    // 資料結構：舉報紀錄
    struct Report {
        address reporter;         // 舉報人地址
        string cid;               // 舉報內容在 IPFS 的 CID
        uint256 timestamp;        // 舉報時間（區塊時間）
        bool approved;            // 是否已審核通過
    }

    Report[] public reports; // 所有舉報紀錄陣列
    IRewardToken public token; // 可鑄幣的 ERC20 代幣合約
    address public owner;       // 合約擁有者
    uint256 public rewardAmount = 10 * 1e18; // 每次獎勵 10 顆代幣

    // 記錄每個使用者上次獲得獎勵的日期（以天為單位）
    mapping(address => uint256) public lastRewardedDay;

    // 記錄每個使用者每天提交的報告次數
    mapping(address => mapping(uint256 => uint256)) public dailyReportCount;

    address[] public approvers; // 三位審核官地址陣列

    // 每筆報告的簽名紀錄：某位官員是否已簽署該筆報告
    mapping(uint256 => mapping(address => bool)) public hasSigned;

    // 每筆報告目前累積的簽名數
    mapping(uint256 => uint256) public signatureCount;

    // 當使用者提交報告時觸發
    event ReportSubmitted(address indexed reporter, string cid, uint256 timestamp);

    // 當報告獲得最終審核時觸發
    event ReportApproved(uint256 indexed reportId, address indexed reporter, uint256 rewardAmount);

    // 當某位官員簽署某筆報告時觸發
    event ReportSigned(uint256 indexed reportId, address indexed approver);

    // 僅限 owner 呼叫的權限控制
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // 僅限 approver 呼叫的權限控制
    modifier onlyApprover() {
        bool valid = false;
        for (uint i = 0; i < approvers.length; i++) {
            if (approvers[i] == msg.sender) {
                valid = true;
                break;
            }
        }
        require(valid, "Not an approver");
        _;
    }

    // 建構子：初始化代幣合約位址與三位官員名單
    constructor(address tokenAddress, address[] memory approverList) {
        token = IRewardToken(tokenAddress);
        owner = msg.sender;
        approvers = approverList;
    }

    // 提交報告：傳入 CID，記錄時間與記錄每日提交次數
    function submitReport(string calldata cid) external {
        uint256 currentDay = block.timestamp / 1 days;
        dailyReportCount[msg.sender][currentDay]++;

        reports.push(Report(msg.sender, cid, block.timestamp, false));
        emit ReportSubmitted(msg.sender, cid, block.timestamp);
    }

    // 官員簽署報告：記錄簽名與累加簽名數
    function signReport(uint256 index) external onlyApprover {
        require(index < reports.length, "Invalid report index");
        require(!reports[index].approved, "Already approved");
        require(!hasSigned[index][msg.sender], "Already signed");

        hasSigned[index][msg.sender] = true;
        signatureCount[index]++;

        emit ReportSigned(index, msg.sender);
    }

    // 當簽名滿 3 人後，任何人皆可觸發最終審核流程，發送獎勵
    function finalizeApproval(uint256 index) external {
        Report storage r = reports[index];
        require(!r.approved, "Already approved");
        require(signatureCount[index] >= 3, "Not enough signatures");

        r.approved = true;

        uint256 currentDay = block.timestamp / 1 days;
        if (lastRewardedDay[r.reporter] < currentDay) {
            lastRewardedDay[r.reporter] = currentDay;
            token.mint(r.reporter, rewardAmount);
            emit ReportApproved(index, r.reporter, rewardAmount);
        } else {
            emit ReportApproved(index, r.reporter, 0); // 今日已領過獎勵，不再發送
        }
    }

    // 查詢目前報告數量
    function getReportCount() external view returns (uint256) {
        return reports.length;
    }

    // 查詢某筆報告的內容與狀態
    function getReport(uint256 index) external view returns (address, string memory, uint256, bool) {
        Report storage r = reports[index];
        return (r.reporter, r.cid, r.timestamp, r.approved);
    }

    // 設定每次審核通過後發送的獎勵金額（僅限 owner）
    function setRewardAmount(uint256 newAmount) external onlyOwner {
        rewardAmount = newAmount;
    }

    // 查詢某位使用者今天是否已經領取過獎勵
    function hasReceivedRewardToday(address user) external view returns (bool) {
        uint256 currentDay = block.timestamp / 1 days;
        return lastRewardedDay[user] >= currentDay;
    }

    // 查詢某位使用者今天提交了幾次舉報
    function getDailyReportCount(address user) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        return dailyReportCount[user][currentDay];
    }
}
