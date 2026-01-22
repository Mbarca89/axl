declare module "react-select-country-list" {
  type CountryOption = {
    label: string
    value: string
  }

  export default function countryList(): {
    getData(): CountryOption[]
  }
}
