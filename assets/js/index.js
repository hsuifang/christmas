const domain = ``

const ItemCtrl = (function() {
  const data = {
    url: {
      // 報名
      reservation: '/bcs/merry/christmas/add',
      // 檢查身份
      isValidcheck: '/bcs/merry/christmas/check',
      // fire game
      fireGame: '/bcs/merry/christmas/play',
      // sendMsg
      sendMsg: '/bcs/merry/christmas/send'
    },
    liffId: '',
    interval: null,
    userProfile: {},
    playersPrize: {},
    allPrize: [],
    currentIndex: 0,
    count: 0,
    loading: false,
    html__itemCards: '', // html
    html__loading: '<h2 class="loading">?疑 </h2>' // html
  }
  // public
  return {
    // 調整currentIndex 資料
    updateCurrentIndex (index) {
      data.currentIndex = index
    },
    // 調整計數器
    updateCount (count) {
      data.count = count
    },
    // 直接純一個卡片的樣式字串，等到要用的時候，直接裝
    setCardItem (cardItems) {
      // set Start data
      let html = '<li class="card__img__item current" style="background-image:url(\'https://hpiuatdiag.blob.core.windows.net/upload/6296bd82-71de-444c-9a6c-57378bc2b77a.png\')"></li>'
      data.allPrize.push({uid: '0', name: ''})

      // set item from cardItems
      cardItems.forEach((item, index) => {
        // 第一版
        // 圖片樣式：第一筆是current / 最後一筆是out / 其餘是 in
        // let cardStatus = index === 0 ? 'current' : (index === (cardItems.length - 1) ? 'out' : 'in')
        let cardStatus = index === (cardItems.length - 1) ? 'out' : 'in'
        html += `<li class="card__img__item ${cardStatus}" style="background-image:url(${item.imageUrl})"></li>`
        // modify data and set all prize
        data.allPrize.push({
          uid: item.uid,
          name: item.name
        })
      })
      data.html__itemCards = 
        `<div class="card w70 m-auto maxWidth">
          <div class="card__content">
            <p class="card__title">您抽到的是..</p>
            <ul class="card__img" id="itemList">${html}</ul>
          </div>
          <p class="card__footer">X' mAsssage</p>
        </div> `
    },
    // 存取中獎資訊
    setPlayerPrize (prize) {
      data.playersPrize = {
        uid: prize.data.senderUid,
        name: prize.data.senderName
      }
    },
    // 切換loading狀態
    changeLoadingStatus (status) {
      data.loading = status
    },
    // 存取登入者資料
    setUserProfile (profile) {
      data.userProfile = {
        uid: profile.userId,
        imageUrl: profile.pictureUrl,
        name: profile.displayName
      }
    },
    // setLiffId
    setLIFFId (id) {
      data.liffId = id
    },
    // 取資料
    getData () {
      return data
    },
    // 取URL資料
    getUrlData () {
      return data.url
    }
  }
})()

// 畫面
const UICtrl = (function() {
  const UISelectors = {
    gameAction: '#gameAction',
    itemList: '#itemList',
    listItems: '#itemList li',
    currentItem: '#itemList li.current',
    lastItem: '#itemList li.out',
    cardTitle: '.card__title',
    loadingArea: '.coverArea',
    reservationAction: '#xmasReservation'
  }
  // Public methods
  return {
    // 取得所有選擇器
    getSelectors () {
      return UISelectors
    },
    // 切換loading 狀態
    changingLoading (status, content) {
      if (status) {
        ItemCtrl.changeLoadingStatus = status
        document.querySelector(UISelectors.loadingArea).innerHTML = content
        document.querySelector(UISelectors.loadingArea).classList.remove('isload')
      } else {
        ItemCtrl.changeLoadingStatus = status
        document.querySelector(UISelectors.loadingArea).classList.add('isload')
        document.querySelector(UISelectors.loadingArea).innerHTML = ''
      }
    },
    // 顯示提示訊息
    showAlertMessage(msg) {
      let message = `<div class="card w70 m-auto maxWidth">
        <div class="card__content">
          <p class="card__title">！提示訊息</p>
          <p class="pt-2 pb-2">${msg}</p>
        </div>
        <p class="card__footer">X' mAsssage</p>
      </div>`
      this.changingLoading(true, message)
    }
  }
})()

// App Controller
const AppCtrl = (function (UICtrl, ItemCtrl) {
  // Load event listeners
  const loadEventListener = function (page) {
    // Get UI of Christmas
    const UISelectors = UICtrl.getSelectors()
    if (page === 'game') {
      document.querySelector(UISelectors.gameAction).addEventListener('click', fireGameAction)
    } else if (page === 'reservation') {
      document.querySelector(UISelectors.reservationAction).addEventListener('click', reservationGame)
    }
  }
  // [LIFF]:: liff init 
  const liffInit = function(myLiffId) {
    return new Promise ((resolve, reject) => {
      liff.init({
        liffId: myLiffId
      })
      .then(() => {
        resolve('success')
      })
      .catch((err) => {
        reject(new Error(`Error: ${err}`))
      })
    })
  }
  // [LIFF]:: get profile call
  const getProfile = function () {
    return new Promise ((resolve, reject) => {
      liff.getProfile().then(function(profile) {
        ItemCtrl.setUserProfile(profile)
        resolve(profile)
      }).catch(function(error) {
        reject(new Error(error))
      })
    })
  }
  // [LIFF]:: 送出liff 訊息
  const liffSendMesaage = function (name) {
    try {
      liff.sendMessages([{
        'type': 'text',
        'text': `Hey!!! 🎉恭喜你抽中【${name}】 的禮物，希望這不是個狼坑，快去禮物堆中把他領回吧！`
      }]).then(function() {
        console.log('Message sent')
      }).catch(function(error) {
        console.log('Error sending message: ' + error);
      })
    } catch (error) {
    }
  }
  // [LINE]: push message
  const sentMessage = function (uid) {
    let url = `${domain}${ItemCtrl.getUrlData().sendMsg}`

    fetch(url,{
      method: 'POST',
      body: JSON.stringify({uid}),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      return res.json()
    }).then(data => {
      // console.log(data)
    }).catch(e => {
    })
  }
  /**
   * 是否有資格玩這個遊戲 / table是否有這人
   * @param {String} uid 遊戲登入者 playerUid
   */
  const isValidatePlay = function (uid) {
    return new Promise ((resolve, reject) => {
      let url = `${domain}${ItemCtrl.getUrlData().isValidcheck}`
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({uid}),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
          return res.json()
        }).then(data => {
          resolve(data)
        }).catch(e => {
          reject(e)
        })
    })

  }
  // Fire Game
  const fireGameAction = function () {
    // call Api 取獎項
    let url = `${domain}${ItemCtrl.getUrlData().fireGame}`

    // 把卡片資訊帶入頁面
    UICtrl.changingLoading(true, ItemCtrl.getData().html__itemCards)

    // show loading Msg
    document.querySelector(UICtrl.getSelectors().cardTitle).innerText = '準備開始囉！'

    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        uid: ItemCtrl.getData().userProfile.uid
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
        return res.json()
      })
      .then(data => {
        // 存獎項資訊
        ItemCtrl.setPlayerPrize(data)

        // change Title
        document.querySelector(UICtrl.getSelectors().cardTitle).innerText = '您抽到的是...'

        // SetTimeOut 啟動抽卡
        setTimeout(() => {
          ItemCtrl.getData().interval = setInterval(nextCard, 300)
        }, 1000)

      })
      .catch(e => {
        UICtrl.showAlertMessage('發生異常！')
      })
  }
  // 下一張卡片
  const nextCard = function () {
    let minCount = 50
    let currentIndex = ItemCtrl.getData().currentIndex
    let lastIndex = ItemCtrl.getData().currentIndex === 0 ? ItemCtrl.getData().allPrize.length - 1 : ItemCtrl.getData().currentIndex - 1
    let currentCount = ItemCtrl.getData().count
    let matchCard = Boolean(ItemCtrl.getData().playersPrize.uid === ItemCtrl.getData().allPrize[currentIndex].uid)
    const UISelectors = UICtrl.getSelectors()

    document.querySelectorAll(UISelectors.listItems)[lastIndex].className = 'card__img__item out'
    document.querySelector(UISelectors.lastItem).className = 'card__img__item in'
    document.querySelectorAll(UISelectors.listItems)[currentIndex].className = 'card__img__item current'
    
    // 增加計數器
    ItemCtrl.updateCount(currentCount + 1)
    if (currentCount > Math.floor(minCount * Math.random()) && matchCard) {
      // 清除interval
      clearInterval(ItemCtrl.getData().interval)
      // 發送訊息
      sentMessage(ItemCtrl.getData().userProfile.uid)
      // 吐出訊息
      liffSendMesaage(ItemCtrl.getData().playersPrize.name)
      // 關閉liff
      setTimeout(() => { liffClose() }, 1500)
    }

    // 調整目前current 值
    if (currentIndex === ItemCtrl.getData().allPrize.length - 1) {
      ItemCtrl.updateCurrentIndex(0)
    } else {
      let next = currentIndex + 1
      ItemCtrl.updateCurrentIndex(next)
    }
  }
  const liffClose = function () {
    try {
      liff.closeWindow()
    } catch (error) {
    }
    
  }
  /**
   * 報名聖誕節活動
   * @param {String} 報名者 
   */
  const reservationGame = function () {
    let url = `${domain}${ItemCtrl.getUrlData().reservation}`
    let data = ItemCtrl.getData().userProfile
    fetch(url, {
      method: 'POST',
      body: JSON.stringify([data]),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
        return res.json()
      }).then(data => {
        if (data.isSuccess) {
          UICtrl.showAlertMessage('報名成功')
          setTimeout(() => { liffClose() }, 1500)
        } else {
          UICtrl.showAlertMessage('報名失敗')
        }
      }).catch(e => {
        console.log(e)
      })
  }
  // 判斷是否有資料玩遊戲
  return {
    /**
     * 從哪個頁面去呼叫
     * @param {String} page game or reservation 
     */
    init (page, id) {
      // clear localstorage
      // localStorage.clear()

      // Set LIFF ID
      ItemCtrl.setLIFFId(id)

      // Add Loading Mode
      let loadingContent = ItemCtrl.getData()['html__loading']
      UICtrl.changingLoading(true, loadingContent)

      // Load event listener
      loadEventListener(page)

      // liff Init - 取得profile
      liffInit(ItemCtrl.getData().liffId)
        .then((data) => {
          if (!liff.isLoggedIn()) {    
            liff.login()
          } else {
            // 取得登入者資訊
            return getProfile().then(profile => profile)
          }
        }).then((profile) => {
          // 呼叫isValidatePlay 確認
          isValidatePlay(profile.userId).then(info => {
            // loading 狀態為false
            UICtrl.changingLoading(false)
            
            // 判斷入口為game or reservation
            if (page === 'game') {
              // call uid 是否有資格玩遊戲
              if (!info.isSuccess) {
                if (info.data.playerUid) {
                  UICtrl.showAlertMessage(`快去找${info.data.senderName}<br/>拿禮物吧 :)`, info.data.senderImageUrl)
                } else {
                  UICtrl.showAlertMessage(info.data)
                }
              } else {
                // SetItem 到卡片
                ItemCtrl.setCardItem(info.data)
              }
            } else if (page === 'reservation') {
              // 報名
              if (info.isSuccess) {
                UICtrl.showAlertMessage('你已經報名過惹！')
              }
            }
          })
        }).catch(msg => {
          UICtrl.showAlertMessage(msg)
        })      
    } 
  }
})(UICtrl, ItemCtrl)