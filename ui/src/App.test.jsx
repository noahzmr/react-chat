import { until } from 'selenium-webdriver'
import config from './config.json'

let timer = 1000

jest.setTimeout(timer * 120)

// Sign Up Elements
let values = {
  sign_up_elememts_id: {
    name: 'user_name',
    email: 'email',
    password: 'password',
    password_repet: 'password_repet',
    terms: 'terms',
    terms_signup: 'terms_signup',
    sign_up_button: 'sign_up_button',
    keycloak_btn: 'keycloak_btn',
    otp: {
      otp_1: 'otp_1',
      otp_2: 'otp_2',
      otp_3: 'otp_3',
      otp_4: 'otp_4',
      otp_5: 'otp_5',
      otp_6: 'otp_6',
      otp_button: 'otp_button',
      change_otp_type: 'change_otp_type'
    }
  },
  sign_in: {
    label: 'login_label',
    email: 'login_email',
    password: 'login_password',
    login_submit: 'login_submit'
  },
  user: {
    name: 'Jest Test',
    Email: config.JEST_OUTLOOK_USER,
    Password: 'dummy',
    password_repet: 'wrong'
  },
  outlook: {
    email: config.JEST_OUTLOOK_USER,
    password: config.JEST_OUTLOOK_PASSWORD,
    url: 'https://outlook.live.com/owa/',
    login_button_class: 'internal sign-in-link',
    email_input_id: 'i0116',
    password_input_id: 'i0118',
    check_btn: 'idSIButton9',
    not_remeber_btn: 'idBtn_Back'
  },
  keycloak: {
    github_btn_id: 'social-github',
    github_username_id: 'login_field',
    github_password_id: 'password',
    github_signin_class: 'btn btn-primary btn-block js-sign-in-button',
    user: {
      name: config.JEST_GITHUB_USER,
      password: config.JEST_GITHUB_PASSWORD
    }
  },
  mailOptions: {
    sender: 'noah@noerkelit.online',
    welcome: 'Welcome!',
    email_id_sign_up: 'x_chat-sing-up'
  },
  edit: {
    telefonnumber: 'telefonnumber',
    website: 'website',
    streetName: 'streetName',
    housnr: 'housnr',
    city: 'city',
    country: 'country',
    state: 'state',
    zip: 'zip',
    update_user: 'update_user',
    status: 'status_2',
    status_button: 'status_button',
    about: 'about',
    submit: 'update_user',
    picture: 'avatar_profile',
    values: {
      phone: '+49 171 1037007',
      url: 'https://github.com/noahzmr/',
      street: 'Bramfelder Straße',
      street_nr: '121',
      ciry: 'Hamburg',
      country: 'Germany',
      state: 'Hamburg',
      zip: '22305',
      about: 'Hello I change the Status!'
    }
  },
  privatChat: {
    create: 'create_chat_button',
    private: 'create_chat_private',
    user: config.JEST_CHAT_ID,
    submit: 'submit_private'
  },
  chat: {
    chat_id: 'chat_59',
    input_field: 'input',
    send_message_button: 'send_message_button',
    default_msg: 'Hello Noah!',
    special_msg_one: 'I have a question about the topic `javascript`',
    special_msg_two_header:
      '# How can you define a function in JavaScript that takes another function as a parameter and calls it within its own implementation?',
    special_msg_two_body: `
    function add(a, b) {
      return a + b;
    }
    
    function multiply(a, b) {
      return a * b;
    }
    
    function higherOrderFunction(func, a, b) {
      const result = func(a, b);
      return result;
    }
    
    const result1 = higherOrderFunction(add, 2, 3); // result1 = 5
    const result2 = higherOrderFunction(multiply, 2, 3); // result2 = 6
    `,
    special_msg_three_body: `
    graph TD
    A[Funktion] -->|Parameter| B(Funktion);
    B -->|Aufruf| C[Implementierung];
    C -->|Rückgabe| D[Ergebnis];
    `
  }
}

// Click Functions
async function clickElement(id) {
  console.log(`Try to click the Element with the Id ${id}`)
  let element = await driver.findElement(By.id(id))
  let condition = until.elementIsEnabled(element)
  let pos = await driver.findElement(By.id(id)).getRect()
  console.log('pos from the element', id, pos)
  await driver.wait(async (driver) => condition.fn(driver), 15 * timer)
  condition = until.elementIsVisible(element)
  await driver.wait(async (driver) => condition.fn(driver), 15 * timer)
  await driver.actions({ async: true }).clear()

  await driver
    .actions({ async: true })
    .pause(timer / 2)
    .click(element)
    .pause(timer / 2)
    .perform()

  console.log('Succses!')
}
async function clickElementClassName(className) {
  console.log(`Try to click the Element with the Class Name ${className}`)
  let element = await driver.findElement(By.className(className))

  let pos = await element.getRect()
  console.log('pos from the element', className, pos)

  await driver
    .actions({ async: true })
    .pause(timer / 2)
    .click(element)
    .pause(timer / 2)
    .perform()

  console.log('Succses!')
}
async function clickSpan(title) {
  console.log(`Try to click the Span with the Title ${title}`)
  let element = await driver.findElement(By.xpath(`//span[@title="${title}"]`))
  let condition = until.elementIsEnabled(element)
  // let pos = await driver.findElement(By.xpath(`//span[@title="${title}"]`)).getRect()
  // console.log('pos', pos)
  await driver.wait(async (driver) => condition.fn(driver), 10 * timer)
  condition = until.elementIsVisible(element)
  await driver.wait(async (driver) => condition.fn(driver), 10 * timer)
  await driver.actions({ async: true }).clear()

  await driver
    .actions({ async: true })
    .pause(timer / 2)
    .click(element)
    .pause(timer / 2)
    .perform()

  console.log('Succses!')
}

// Enter Values Fuction
async function enterText(id, text) {
  console.log(`Try to change Value from Input: ${id} to: ${text} `)
  let element = await driver.findElement(By.id(id))
  let condition = until.elementIsEnabled(element)
  await driver.wait(async (driver) => condition.fn(driver), 2 * timer)
  await element.clear()
  await driver
    .actions({ async: true })
    .pause(timer / 2)
    .perform()

  // expect(tag).toBe('input')
  let pos = await driver.findElement(By.id(id)).getRect()
  console.log('pos', pos)

  await driver
    .actions({ async: true })
    .click(element)
    .pause(timer / 2)
    .perform()

  await driver
    .actions({ async: true })
    .sendKeys(text)
    .pause(timer / 2)
    .perform()

  console.log('Succses!')
}
async function enterTextSpecial(id, type, body) {
  console.log(`Try to change Value from Input: ${id} to: `)
  let element = await driver.findElement(By.id(values.chat.input_field))
  let condition = until.elementIsEnabled(element)
  await driver.wait(async (driver) => condition.fn(driver), 2 * timer)
  await element.clear()

  await driver
    .actions({ async: true })
    .click(element)
    .pause(timer / 2)
    .perform()

  await driver
    .actions({ async: true })
    .sendKeys('```' + type + body + '```')
    .pause(timer / 2)
    .perform()

  console.log('Succses!')
}
async function enterTextClass(className, text) {
  console.log(`Try to change Value from Input: ${className} to: ${text} `)
  let element = await driver.findElement(By.className(className))
  let condition = until.elementIsEnabled(element)
  await driver.wait(async (driver) => condition.fn(driver), 2 * timer)

  await driver
    .actions({ async: true })
    .pause(timer / 2)
    .perform()

  let tag = await element.getTagName()
  expect(tag).toBe('input')
  let pos = await driver.findElement(By.className(className)).getRect()
  console.log('pos', pos)

  await driver
    .actions({ async: true })
    .click(element)
    .pause(timer / 2)
    .perform()

  await driver
    .actions({ async: true })
    .sendKeys(text)
    .pause(timer / 2)
    .perform()

  console.log('Succses!')
}

// Change Window Function

async function changeWindow(url, className, id) {
  //Store the ID of the original window
  const originalWindow = await driver.getWindowHandle()
  console.log('originalWindow', originalWindow)

  //Check we don't have other windows open already
  // ;(await driver.getAllWindowHandles()).length === 1

  console.log('Go to the website')
  //Click the link which opens in a new window;
  await driver.get(url)

  //Wait for the new window or tab
  console.log('try to switch the Window...')
  //Loop through until we find a new window handle
  const windows = await driver.getAllWindowHandles()
  windows.forEach(async (handle) => {
    if (handle !== originalWindow) {
      await driver.switchTo().window(handle)
      console.log(`Switch to Window with the id ${handle}`)
    }
  })
  await wait(5)
  if (className !== false) {
    await clickElement(id)
  } else if (id !== false) {
    await clickElementClassName(className)
  } else {
    console.log('Nothing to select')
  }
}

async function changeWindowWithouUrl(type, id) {
  //Store the ID of the original window
  const originalWindow = await driver.getWindowHandle()
  console.log('originalWindow', originalWindow)

  //Check we don't have other windows open already
  ;(await driver.getAllWindowHandles()).length === 1

  console.log('Clicking the Link...')
  //Click the link which opens in a new window;
  if (type === 'id') {
    await clickElement(id)
  } else {
    await clickElementClassName(id)
  }

  //Wait for the new window or tab
  console.log('try to switch the Window...')
  //Loop through until we find a new window handle
  const windows = await driver.getAllWindowHandles()
  windows.forEach(async (handle) => {
    if (handle !== originalWindow) {
      await driver.switchTo().window(handle)
      console.log(`Switch to Window with the id ${handle}`)
    }
  })
}

// Wait function
async function wait(second) {
  await driver.sleep(timer * second)
}
// Outlook Function
async function loginOutlook() {
  await changeWindow(values.outlook.url, values.outlook.login_button_class)
  await wait(2)
  await enterText(values.outlook.email_input_id, values.outlook.email)
  await clickElement(values.outlook.check_btn)
  await wait(2)
  await enterText(values.outlook.password_input_id, values.outlook.password)
  await clickElement(values.outlook.check_btn)
  await wait(2)
  await clickElement(values.outlook.not_remeber_btn)
  await wait(2)
}
// Init Function
async function init() {
  // // Connect to the Side
  await driver.get('https://demo.noerkelit.online:3001/')
  // Chech if the Side is up
  await driver.getTitle().then((title) => {
    expect(title).toBe('Chat')
  })
}

afterEach(async () => cleanup())

/*
 Auth Custom Functions
*/
//Login
async function login() {
  await clickElement(values.sign_in.label)
  await enterText(values.sign_in.email, values.user.Email)
  await enterText(values.sign_in.password, values.user.Password)
  await clickElement(values.sign_in.login_submit)
}
// Signup
async function signupSuccsess() {
  // // File the Values
  await enterText(values.sign_up_elememts_id.name, values.user.name)
  await enterText(values.sign_up_elememts_id.email, values.user.Email)
  await enterText(values.sign_up_elememts_id.password, values.user.Password)
  await enterText(values.sign_up_elememts_id.password_repet, values.user.Password)
  // Accept Terms
  await clickElement(values.sign_up_elememts_id.terms)
  //Submit Form
  await clickElement(values.sign_up_elememts_id.sign_up_button)

  // Login to Outlook
  await loginOutlook()
  await clickSpan(values.mailOptions.sender)
  await wait(1)
  await clickElement(values.mailOptions.email_id_sign_up)
  await wait(2)
  console.log(
    'BUTTON VALUE: ',
    await driver.findElement(By.id(values.mailOptions.email_id_sign_up)).getAttribute('value')
  )
  await changeWindow(
    await driver.findElement(By.id(values.mailOptions.email_id_sign_up)).getAttribute('value'),
    false,
    values.mailOptions.email_id_sign_up
  )
}
async function signupError() {
  // // File the Values
  await enterText(values.sign_up_elememts_id.name, values.user.name)
  await enterText(values.sign_up_elememts_id.email, values.user.Email)
  await enterText(values.sign_up_elememts_id.password, values.user.Password)
  await enterText(values.sign_up_elememts_id.password_repet, values.user.password_repet)
  await clickElement(values.sign_up_elememts_id.sign_up_button)
  await wait(2)
  // Accept Terms
  await clickElement(values.sign_up_elememts_id.terms)
  //Submit Form
  await clickElement(values.sign_up_elememts_id.sign_up_button)
  await wait(2)
  await enterText(values.sign_up_elememts_id.password_repet, values.user.Password)
  await wait(2)
  await clickElement(values.sign_up_elememts_id.sign_up_button)
  await login()
  await wait(2)
}

// Keycloak Functions
async function signInKeycloak() {
  await changeWindowWithouUrl('id', values.sign_up_elememts_id.keycloak_btn)
  await clickElement(values.keycloak.github_btn_id)
  await enterText(values.keycloak.github_username_id, values.keycloak.user.name)
  await enterText(values.keycloak.github_password_id, values.keycloak.user.password)
  await wait(1)
  await changeWindowWithouUrl('className', values.keycloak.github_signin_class)
  await wait(8)
}

// Write a message
async function createMsg(msg) {
  await enterText(values.chat.input_field, msg)
  await clickElement(values.chat.send_message_button)
}

/* 
Test functions
all functions can past in a
  test('<name>, async ()=>{})
*/
// Signup Test
async function signUpCustomSuccsess() {
  await init()
  await signupSuccsess()
}
async function signUpCustomError() {
  await init()
  await signupError()
}
async function signUpCustomWithoutOtp() {
  await init()
  await login()
  await clickElement(values.sign_up_elememts_id.otp.otp_button)
  await wait(2)
}
async function signUpCustomWithOtp() {
  await init()
  await login()
  await clickElement(values.sign_up_elememts_id.otp.change_otp_type)
  await clickElement(values.sign_up_elememts_id.otp.otp_1)
  // Time to Scann and enter the OTP
  await wait(5)
  await clickElement(values.sign_up_elememts_id.otp.otp_button)
  await wait(2)
}
async function keycloakSignUp() {
  await init()
  await signInKeycloak()
  await wait(2)
  await clickElement(values.sign_up_elememts_id.terms_signup)
  await wait(1)
  await clickElement(values.sign_up_elememts_id.sign_up_button)
  await wait(2)
}

async function keycloakSignIn() {
  await init()
  await signInKeycloak()
  await wait(5)
}
// Profile
async function editProfile() {
  await init()
  await login()
  await wait(5)
  await enterText(values.edit.about, values.edit.values.about)
  await clickElement(values.edit.status_button)
  await clickElement(values.edit.status)
  await enterText(values.edit.telefonnumber, values.edit.values.phone)
  await enterText(values.edit.website, values.edit.values.url)
  await enterText(values.edit.streetName, values.edit.values.street)
  await enterText(values.edit.housnr, values.edit.values.street_nr)
  await enterText(values.edit.city, values.edit.values.ciry)
  await enterText(values.edit.country, values.edit.values.country)
  await enterText(values.edit.state, values.edit.values.state)
  await enterText(values.edit.zip, values.edit.values.zip)
  await clickElement(values.edit.submit)
  await wait(4)
}
// Chat
async function createNewDm() {
  await init()
  await login()
  await clickElement(values.privatChat.create)
  await clickElement(values.privatChat.private)
  await clickElement(values.privatChat.user)
  await clickElement(values.privatChat.submit)
  await wait(4)
}
async function chatMessanges() {
  await init()
  await login()
  await wait(1)
  await clickElement(values.chat.chat_id)
  await createMsg(values.chat.default_msg)
  await wait(2)
  await createMsg(values.chat.special_msg_one)
  await createMsg(values.chat.special_msg_two_header)
  await enterTextSpecial(values.chat.input_field, 'js', values.chat.special_msg_two_body)
  await clickElement(values.chat.send_message_button)
  await enterTextSpecial(values.chat.input_field, 'mermaid', values.chat.special_msg_three_body)
  await clickElement(values.chat.send_message_button)
  await wait(2)
}

// Execuse a Test case
test('Run test', async () => {
  await chatMessanges()
  await wait(2)
})
