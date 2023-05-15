import axios from 'axios'
import React, { useState, useEffect, useContext } from 'react'
import WebPictureProfile from './picture'
import { BackendContext } from '../../Services/default_values'
import { useNavigate, Outlet } from 'react-router-dom'
export default function Informations(props) {
  const navigate = useNavigate()
  const [backend, setBackend] = useContext(BackendContext)
  const userID = localStorage.getItem('user')
  const [userName, setUserName] = useState(null)
  const [email, setEmail] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState(null)
  const [website, setWebsite] = useState(null)
  const [street, setStreet] = useState(null)
  const [streetNr, setStreetNr] = useState(null)
  const [city, setCity] = useState(null)
  const [country, setCountry] = useState(null)
  const [state, setState] = useState(null)
  const [zip, setZip] = useState(null)
  const [status, setStatus] = useState(null)
  const [statusColor, setStatusColor] = useState(null)
  const [about, setAbout] = useState(null)
  const [gender, setGender] = useState(null)
  const [userNameDe, setUserNameDe] = useState(null)
  const [emailDe, setEmailDe] = useState(null)
  const [phoneNumberDe, setPhoneNumberDe] = useState(null)
  const [websiteDe, setWebsiteDe] = useState(null)
  const [streetDe, setStreetDe] = useState(null)
  const [streetNrDe, setStreetNrDe] = useState(null)
  const [cityDe, setCityDe] = useState(null)
  const [countryDe, setCountryDe] = useState(null)
  const [stateDe, setStateDe] = useState(null)
  const [zipDe, setZipDe] = useState(null)
  const [statusDe, setStatusDe] = useState(null)
  const [aboutDe, setAboutDe] = useState(null)
  const [genderDe, setGenderDe] = useState(null)
  const [statusList, setStatusList] = useState(null)
  const [edit, setEdit] = useState(false)
  const [notification, setNotication] = useState('none')
  const [message, setMessage] = useState()
  const [type, setType] = useState('alert')

  const CheckEdit = (type, value) => {
    if (type === 'userName' && value !== userNameDe) {
      if (userNameDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'email' && value !== emailDe) {
      if (emailDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'phoneNumber' && value !== phoneNumberDe) {
      if (phoneNumberDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'website' && value !== websiteDe) {
      if (websiteDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'street' && value !== streetDe) {
      if (streetDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'streetNr' && value !== streetNrDe) {
      if (streetNrDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'city' && value !== cityDe) {
      if (cityDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'country' && value !== countryDe) {
      if (countryDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'state' && value !== stateDe) {
      if (stateDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'zip' && value !== zipDe) {
      if (zipDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'status' && value !== statusDe) {
      if (statusDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'about' && value !== aboutDe) {
      if (aboutDe === null && value === '') {
        setEdit(false)
      } else {
        setEdit(true)
      }
    } else if (type === 'gender' && value !== genderDe) {
      setEdit(true)
    } else {
      setEdit(false)
    }
  }

  const getValues = () => {
    axios
      .get(`${backend}users/${userID}/values`)
      .then((res) => {
        console.log('[USER] Values: ', res.data)
        setUserName(res.data.name)
        setEmail(res.data.email)
        setPhoneNumber(res.data.phone_number)
        setWebsite(res.data.website)
        setStreet(res.data.street)
        setStreetNr(res.data.street_nr)
        setCity(res.data.city)
        setCountry(res.data.country)
        setState(res.data.state)
        setZip(res.data.zip)
        setStatus(res.data.statusName)
        setStatusColor(res.data.statusColor)
        setAbout(res.data.about_information)

        setUserNameDe(res.data.name)
        setEmailDe(res.data.email)
        setPhoneNumberDe(res.data.phone_number)
        setWebsiteDe(res.data.website)
        setStreetDe(res.data.street)
        setStreetNrDe(res.data.street_nr)
        setCityDe(res.data.city)
        setCountryDe(res.data.country)
        setStateDe(res.data.state)
        setZipDe(res.data.zip)
        setStatusDe(res.data.statusName)
        setAboutDe(res.data.about_information)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  const showNotification = (msg, type) => {
    setNotication('block')
    setMessage(msg)
    setType(type)
    setTimeout(() => {
      setNotication('none')
    }, 5000)
  }

  const updateValues = () => {
    const values = {
      userName: userName,
      email: email,
      phoneNumber: phoneNumber,
      website: website,
      street: street,
      streetNr: streetNr,
      city: city,
      country: country,
      state: state,
      zip: zip,
      status: status,
      about: about,
      gender: gender
    }
    axios
      .put(`${backend}users/${userID}/values`, values)
      .then((res) => {
        console.log('[USER] Values Updated: ', res.data)
        getValues()
        setEdit(false)
        showNotification(`Your data has been adjusted!`, 'warn')
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  const getStatus = () => {
    axios
      .get(`${backend}users/status`)
      .then((res) => {
        console.log('[Status] Values: ', res.data)
        setStatusList(res.data)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }
  useEffect(() => {
    getValues()
    getStatus()
  }, [])

  return (
    <div className="informationContainer">
      <label style={{ display: notification }} className={`alert-message ${type}`}>
        {message}
        <span
          onClick={() => {
            setNotication('none')
          }}
          className="close">
          ×
        </span>
      </label>
      <Outlet />
      <div className="card" style={{ gridArea: 'pictureCon' }}>
        <div className="card-body">
          <WebPictureProfile />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'center'
            }}>
            <div className="genderSel">
              <div
                onClick={() => {
                  if (gender === 'male') {
                    CheckEdit('gender', 'female')
                    setGender('female')
                  } else {
                    CheckEdit('gender', 'male')
                    setGender('male')
                  }
                  console.log(gender)
                }}>
                <i className={gender === 'male' ? 'bi bi-gender-male' : 'bi bi-gender-female'}></i>
              </div>
            </div>
            <div className="dropdown" style={{ color: 'var(--w)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'center',
                  border: 'none'
                }}>
                <i
                  id="status_button"
                  className="bi bi-circle"
                  style={{ color: statusColor, margin: '1em 0 0 1em' }}></i>
                <p>Status</p>
              </div>
              <div className="dropdown-content">
                {statusList?.map((item) => {
                  return (
                    <div
                      id={`status_${item.id}`}
                      key={item.id}
                      onClick={() => {
                        setStatus(item.id)
                        setStatusColor(item.color)
                        CheckEdit('status', item.id)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        textAlign: 'center',
                        border: 'none'
                      }}>
                      <i
                        className="bi bi-circle"
                        style={{ color: item.color, margin: '1em 0 0 1em' }}></i>
                      <p>{item.name}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="account-settings">
            <h5>{userName}</h5>
            <h6>{email}</h6>
            <label className="input">
              <input
                id="about"
                className="input__field"
                type="text"
                placeholder=" "
                value={about}
                onChange={(e) => {
                  CheckEdit('about', e.target.value)
                  setAbout(e.target.value)
                }}
              />
              <span className="input__label">About</span>
            </label>
          </div>
        </div>
      </div>
      <div className="card" style={{ gridArea: 'information' }}>
        <div className="card-body">
          <div>
            <h4>Personal Details</h4>
          </div>
          <div className="grid">
            <label className="input">
              <input
                className="input__field"
                type="text"
                placeholder=" "
                value={userName}
                onChange={(e) => {
                  CheckEdit('userName', e.target.value)
                  setUserName(e.target.value)
                }}
              />
              <span className="input__label">Full Name</span>
            </label>
            <label className="input">
              <input
                className="input__field"
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => {
                  CheckEdit('email', e.target.value)
                  setEmail(e.target.value)
                }}
              />
              <span className="input__label">Email</span>
            </label>
            <label className="input">
              <input
                className="input__field"
                id="telefonnumber"
                type="tel"
                placeholder=" "
                value={phoneNumber}
                onChange={(e) => {
                  CheckEdit('phoneNumber', e.target.value)
                  setPhoneNumber(e.target.value)
                }}
              />
              <span className="input__label">Phone</span>
            </label>
            <label className="input">
              <input
                className="input__field"
                type="url"
                id="website"
                placeholder=" "
                value={website}
                onChange={(e) => {
                  CheckEdit('website', e.target.value)
                  setWebsite(e.target.value)
                }}
              />
              <span className="input__label">Website URL</span>
            </label>
          </div>
        </div>
        <div>
          <div>
            <h4>Address</h4>
          </div>
          <div className="grid">
            <label className="input">
              <input
                id="streetName"
                className="input__field"
                type="text"
                placeholder=" "
                value={street}
                onChange={(e) => {
                  CheckEdit('street', e.target.value)
                  setStreet(e.target.value)
                }}
              />
              <span className="input__label">Street</span>
            </label>
            <label className="input">
              <input
                className="input__field"
                id="housnr"
                type="number"
                placeholder=" "
                value={streetNr}
                onChange={(e) => {
                  CheckEdit('streetNr', e.target.value)
                  setStreetNr(e.target.value)
                }}
              />
              <span className="input__label">Nr.</span>
            </label>
            <label className="input">
              <input
                id="city"
                className="input__field"
                type="text"
                placeholder=" "
                value={city}
                onChange={(e) => {
                  CheckEdit('city', e.target.value)
                  setCity(e.target.value)
                }}
              />
              <span className="input__label">City</span>
            </label>
            <label className="input">
              <input
                className="input__field"
                id="country"
                type="text"
                placeholder=" "
                value={country}
                onChange={(e) => {
                  CheckEdit('country', e.target.value)
                  setCountry(e.target.value)
                }}
              />
              <span className="input__label">Country</span>
            </label>
            <label className="input">
              <input
                id="state"
                className="input__field"
                type="text"
                placeholder=" "
                value={state}
                onChange={(e) => {
                  CheckEdit('state', e.target.value)
                  setState(e.target.value)
                }}
              />
              <span className="input__label">State</span>
            </label>
            <label className="input">
              <input
                className="input__field"
                type="text"
                placeholder=" "
                value={zip}
                id="zip"
                onChange={(e) => {
                  CheckEdit('zip', e.target.value)
                  setZip(e.target.value)
                }}
              />
              <span className="input__label">ZIP</span>
            </label>
          </div>
        </div>
        <div className="btnContainer" style={{ display: edit ? 'flex' : 'none' }}>
          <button
            onClick={() => {
              navigate('/user/delete')
            }}
            style={{ background: 'none', border: '1px solid gray' }}
            className="secondary">
            Delete
          </button>
          <button
            onClick={() => {
              navigate('/user')
            }}
            style={{ background: '#6c757d' }}
            className="secondary">
            Cancle
          </button>
          <button
            id="update_user"
            style={{ background: '#007bff' }}
            onClick={() => {
              updateValues()
            }}>
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
