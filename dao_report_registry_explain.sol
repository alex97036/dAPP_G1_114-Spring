// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 定義一個手機號碼零知識驗證的介面，實際合約需實作 verify() 方法來驗證手機號碼
interface IZKPhoneVerifier {
    function verify(bytes calldata proof, string calldata phoneHash) external view returns (bool);
}

// 定義一個可鑄幣的代幣介面，提供 mint 功能
interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

// 主合約：舉報平台
contract ReportRegistry {
    // 定義舉報資料的結構：包括提交人、內容CID、時間戳與是否已審核
    struct Report {
        address reporter;
        string cid;
        uint256 timestamp;
        bool approved; // 已審核
    }

    Report[] public reports; // 所有舉報記錄陣列
    IRewardToken public token; // 用於發放獎勵的 ERC20 代幣合約
    IZKPhoneVerifier public verifier; // 手機號碼 ZKP 驗證合約
    address public owner; // 合約擁有者
    uint256 public rewardAmount = 10 * 1e18; // 每次審核通過可發放的獎勵數量，單位為代幣的最小單位

    // 記錄使用者上一次獲得獎勵的日期（以 epoch 天數為單位）
    mapping(address => uint256) public lastRewardedDay;

    // 記錄使用者每日提交檢舉的次數：user => day => 次數
    mapping(address => mapping(uint256 => uint256)) public dailyReportCount;

    // 提交舉報事件
    event ReportSubmitted(address indexed reporter, string cid, uint256 timestamp);

    // 報告經審核後批准的事件（包含是否有發放獎勵）
    event ReportApproved(uint256 indexed reportId, address indexed reporter, uint256 rewardAmount);

    // 僅允許擁有者執行的修飾子
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // 建構子：初始化合約，設定代幣與驗證器地址
    constructor(address tokenAddress, address verifierAddress) {
        token = IRewardToken(tokenAddress);
        verifier = IZKPhoneVerifier(verifierAddress);
        owner = msg.sender;
    }

    // 提交檢舉報告，需附帶 ZKP 證明與手機號碼哈希（phoneHash）
    function submitReportWithZKP(string calldata cid, string calldata phoneHash, bytes calldata proof) external {
        require(verifier.verify(proof, phoneHash), "Invalid phone verification"); // 呼叫驗證器驗證是否有效

        uint256 currentDay = block.timestamp / 1 days;
        dailyReportCount[msg.sender][currentDay]++; // 增加今日提交次數

        reports.push(Report(msg.sender, cid, block.timestamp, false)); // 新增報告記錄
        emit ReportSubmitted(msg.sender, cid, block.timestamp); // 發出事件
    }

    // 擁有者呼叫，對指定報告進行審核與決定是否發放獎勵
    function approveReportAndReward(uint256 index) external onlyOwner {
        Report storage r = reports[index];
        require(!r.approved, "Already approved");

        r.approved = true; // 設為已審核

        uint256 currentDay = block.timestamp / 1 days;
        if (lastRewardedDay[r.reporter] < currentDay) {
            lastRewardedDay[r.reporter] = currentDay; // 更新當日獎勵狀態
            token.mint(r.reporter, rewardAmount); // 鑄幣發放獎勵
            emit ReportApproved(index, r.reporter, rewardAmount);
        } else {
            emit ReportApproved(index, r.reporter, 0); // 已獲得獎勵，這次不重複發
        }
    }

    // 回傳目前已提交的報告總筆數
    function getReportCount() external view returns (uint256) {
        return reports.length;
    }

    // 查詢單一報告的詳細資訊
    function getReport(uint256 index) external view returns (address, string memory, uint256, bool) {
        Report storage r = reports[index];
        return (r.reporter, r.cid, r.timestamp, r.approved);
    }

    // 擁有者可修改發放獎勵的數量
    function setRewardAmount(uint256 newAmount) external onlyOwner {
        rewardAmount = newAmount;
    }

    // 查詢某用戶今天是否已經獲得過獎勵
    function hasReceivedRewardToday(address user) external view returns (bool) {
        uint256 currentDay = block.timestamp / 1 days;
        return lastRewardedDay[user] >= currentDay;
    }

    // 查詢某用戶今天提交了幾次舉報
    function getDailyReportCount(address user) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        return dailyReportCount[user][currentDay];
    }
}
