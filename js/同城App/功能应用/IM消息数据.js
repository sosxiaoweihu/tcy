const imConversations = [
  {
    id: "im-001",
    channel: "美团外卖",
    customerName: "张先生",
    order: { orderNo: "400975620959916601", createdTime: "10-10 15:00", paidAmount: "29.3" },
    orderShortNo: "18",
    isPreorder: true,
    stores: ["家得福海棠店", "家得福中央华府店", "家得福双盛花园店", "家得福灌云万达店", "家得福嘉会城店"],
    time: "15:06",
    date: "今天",
    preview: "请问这个牛奶是今天生产的吗？",
    pending: true,
    unread: 2,
    messages: [
      { sender: "customer", text: "您好，请问这个牛奶是今天生产的吗？", time: "今天 15:04" },
      { sender: "customer", text: "如果日期新鲜的话麻烦尽快配送，谢谢。", time: "今天 15:06" }
    ]
  },
  {
    id: "im-002",
    channel: "京东秒送",
    customerName: "李小姐",
    order: { orderNo: "400975620959916602", createdTime: "10-10 14:20", paidAmount: "46.8" },
    orderShortNo: "39",
    isPreorder: true,
    stores: ["家得福海棠店", "家得福中央华府店", "家得福嘉会城店"],
    time: "14:38",
    date: "今天",
    preview: "订单大约多久可以送到？",
    pending: true,
    unread: 1,
    messages: [
      { sender: "customer", text: "您好，订单显示正在拣货，大约多久可以送到？", time: "今天 14:38" }
    ]
  },
  {
    id: "im-003",
    channel: "饿了么",
    customerName: "1111",
    order: { orderNo: "400975620959916666", createdTime: "10-10 13:40", paidAmount: "29.3" },
    orderShortNo: "282",
    isPreorder: false,
    stores: ["家得福海棠店", "家得福双盛花园店"],
    time: "13:52",
    date: "今天",
    preview: "可以帮我换成无糖的吗？",
    pending: true,
    unread: 1,
    messages: [
      { sender: "customer", text: "刚才下单选错口味了，可以帮我换成无糖的吗？", time: "今天 13:52" }
    ]
  },
  {
    id: "im-004",
    channel: "抖店",
    customerName: "王女士",
    order: { orderNo: "400975620959916604", createdTime: "10-10 11:10", paidAmount: "58.0" },
    orderShortNo: "124",
    isPreorder: false,
    stores: ["家得福海棠店", "家得福灌云万达店"],
    time: "11:26",
    date: "今天",
    preview: "到店自提需要出示什么？",
    pending: true,
    unread: 1,
    messages: [
      { sender: "customer", text: "您好，到店自提需要出示订单号还是券码？", time: "今天 11:26" }
    ]
  },
  {
    id: "im-007",
    channel: "美团外卖",
    customerName: "陈先生",
    order: null,
    orderShortNo: "86",
    isPreorder: false,
    stores: ["家得福海棠店", "家得福中央华府店", "家得福双盛花园店"],
    time: "10:19",
    date: "今天",
    preview: "好的，麻烦您了。",
    pending: false,
    unread: 0,
    messages: [
      { sender: "customer", text: "这款面包还有现货吗？", time: "今天 10:12" },
      { sender: "merchant", text: "您好，当前有现货，下单后会尽快为您配送。", time: "今天 10:16" },
      { sender: "customer", text: "好的，麻烦您了。", time: "今天 10:18" },
      { sender: "merchant", text: "不客气，祝您购物愉快。", time: "今天 10:19" }
    ]
  },
  {
    id: "im-008",
    channel: "京东秒送",
    customerName: "小美",
    order: null,
    orderShortNo: "57",
    isPreorder: false,
    stores: ["家得福海棠店", "家得福嘉会城店"],
    time: "09:43",
    date: "今天",
    preview: "好的，我现在下单。",
    pending: false,
    unread: 0,
    messages: [
      { sender: "customer", text: "请问可以开发票吗？", time: "今天 09:38" },
      { sender: "merchant", text: "您好，订单完成后可在订单页申请开具发票。", time: "今天 09:40" },
      { sender: "customer", text: "好的，我现在下单。", time: "今天 09:42" },
      { sender: "merchant", text: "好的，感谢您的支持。", time: "今天 09:43" }
    ]
  },
  {
    id: "im-009",
    channel: "饿了么",
    customerName: "安然",
    order: { orderNo: "400975620959916609", createdTime: "10-10 09:00", paidAmount: "36.5" },
    orderShortNo: "63",
    isPreorder: true,
    stores: ["家得福海棠店", "家得福双盛花园店", "家得福灌云万达店"],
    time: "09:16",
    date: "今天",
    preview: "收到，感谢您的回复。",
    pending: false,
    unread: 0,
    messages: [
      { sender: "customer", text: "配送员到了之后可以放在前台吗？", time: "今天 09:10" },
      { sender: "merchant", text: "可以的，我们会备注配送员放至前台。", time: "今天 09:13" },
      { sender: "customer", text: "收到，感谢您的回复。", time: "今天 09:15" },
      { sender: "merchant", text: "不客气，我们会尽快安排配送。", time: "今天 09:16" }
    ]
  },
  {
    id: "im-005",
    channel: "美团外卖",
    customerName: "周女士",
    order: { orderNo: "400975620959916605", createdTime: "10-09 18:00", paidAmount: "45.9" },
    orderShortNo: "105",
    isPreorder: false,
    stores: ["家得福海棠店", "家得福中央华府店"],
    time: "昨天",
    date: "昨天",
    preview: "好的，谢谢您的处理。",
    pending: false,
    unread: 0,
    messages: [
      { sender: "customer", text: "收到的水果有一盒压坏了，可以处理吗？", time: "昨天 18:21" },
      { sender: "merchant", text: "非常抱歉，我们已经为您办理部分退款，请注意查收。", time: "昨天 18:25" },
      { sender: "customer", text: "好的，谢谢您的处理。", time: "昨天 18:27" }
    ]
  },
  {
    id: "im-006",
    channel: "京东秒送",
    customerName: "阿杰",
    order: { orderNo: "400975620959916606", createdTime: "10-05 09:50", paidAmount: "68.0" },
    orderShortNo: "92",
    isPreorder: false,
    stores: ["家得福海棠店", "家得福嘉会城店"],
    time: "周一",
    date: "本周一",
    preview: "已经收到了，包装完好。",
    pending: false,
    unread: 0,
    messages: [
      { sender: "merchant", text: "您的订单已交给配送员，请留意电话。", time: "周一 10:12" },
      { sender: "customer", text: "已经收到了，包装完好。", time: "周一 10:42" }
    ]
  }
];
