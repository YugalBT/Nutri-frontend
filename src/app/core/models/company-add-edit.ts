export interface Company {
  companyName: string;
  code: string;
  url: string;
  primaryColor: string;
  secondaryColor: string | null;
  logo: string | null;
  
  firstName: string;
  middleName: string;
  lastName: string;
  // suffix: string | null;
  email: string;
  phoneNumber: string;
 
  streetAddress: string;
  city: string;
  country: string;
  zipCode: string;
  password: string;


  userFirstName: string;
  userMiddleName: string;
  userLastName: string;
  userEmail: string;
  userPhoneNumber: string;

  TenantId : string | null;

 

}
