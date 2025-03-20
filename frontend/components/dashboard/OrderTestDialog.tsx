import { VStack,
    Heading,
    Text,
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    FormHelperText,
    Select,
    SimpleGrid,
    Input,
    RadioGroup,
    Radio,
    Stack,
    useToast
} from "@chakra-ui/react";
import { fetcher } from "../../lib/client";
import useSWR from "swr";
import { useState } from "react";
import { US_STATES } from '../../constants/location';

// Add this interface
interface LabTestTemplate {
  id: number;
  name: string;
  description: string;
  tests: Array<{
    name: string;
    description: string;
  }>;
}

interface PatientForm {
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  phone_number: string;
  email: string;
  address_line: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export const OrderTestDialog = () => {
  const toast = useToast();
  // Add useDisclosure hook to control the modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = useSWR("/users/", fetcher);
  const { data: templates } = useSWR<LabTestTemplate[]>("/tests/", fetcher);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [collectionMethod, setCollectionMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add form state
  const [patientForm, setPatientForm] = useState<PatientForm>({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "female",
    phone_number: "",
    email: "",
    address_line: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
  });

  const handleFormChange = (field: keyof PatientForm, value: string) => {
    setPatientForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const orderData: OrderData = {
        user_id: selectedUser,
        patient_details: {
          first_name: patientForm.first_name,
          last_name: patientForm.last_name,
          dob: patientForm.dob,
          gender: patientForm.gender,
          phone_number: patientForm.phone_number,
          email: patientForm.email,
        },
        patient_address: {
          first_line: patientForm.address_line,
          city: patientForm.city,
          state: patientForm.state,
          zip: patientForm.zip,
          country: patientForm.country,
        },
        lab_test_id: selectedTest,
        collection_method: collectionMethod,
      };

      const response = await fetch("/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create order';
        
        // Try to get detailed error message from response
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Handle different types of errors
        if (response.status === 400) {
          throw new Error(`Invalid request: ${errorMessage}`);
        } else if (response.status === 500) {
          throw new Error(`Server error: ${errorMessage}`);
        } else {
          throw new Error(errorMessage);
        }
      }

      // Show success toast
      toast({
        title: "Order created",
        description: "Your lab test order has been successfully created",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
      
      // Show error toast
      toast({
        title: "Error creating order",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        status: "error",
        duration: 7000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const usersFiltered = data?.users ? data.users : [];
  
  // Add this function to check if all required fields are filled
  const isFormValid = () => {
    // Check if all required fields are filled
    const requiredFields = {
      // Form selections
      selectedUser,
      selectedTest,
      collectionMethod,
      // Patient details
      'first_name': patientForm.first_name,
      'last_name': patientForm.last_name,
      'dob': patientForm.dob,
      'gender': patientForm.gender,
      'phone_number': patientForm.phone_number,
      'email': patientForm.email,
      // Address details
      'address_line': patientForm.address_line,
      'city': patientForm.city,
      'state': patientForm.state,
      'zip': patientForm.zip,
      'country': patientForm.country,
    };

    return Object.values(requiredFields).every(field => field && field.trim() !== '');
  };

  return (
    <Box>
      <Button colorScheme="blue" onClick={onOpen}>Order Test</Button>
      
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Test</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Text fontWeight="medium">Please fill out the form below to order tests:</Text>
              
              <FormControl isRequired>
                <FormLabel>Patient</FormLabel>
                <Select 
                  placeholder="Select patient"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {usersFiltered.map((user: any) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.client_user_id}
                    </option>
                  ))}
                </Select>
                <FormHelperText>Select the patient for whom the test is being ordered</FormHelperText>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Payor</FormLabel>
                <Select placeholder="Select payor">
                  <option value="self">Self</option>
                  <option value="relative">Relative</option>
                  <option value="other">Other</option>
                </Select>
                <FormHelperText>Select who will be paying for the test</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Collection Method</FormLabel>
                <Select 
                  placeholder="Select Collection Method"
                  value={collectionMethod}
                  onChange={(e) => setCollectionMethod(e.target.value)}
                >
                  <option value="at-home">At-Home</option>
                  <option value="walk-in">Walk-In</option>
                  <option value="self-test-kit">Self-test kit</option>
                </Select>
                <FormHelperText>Select collection method for the test</FormHelperText>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Lab Test Template</FormLabel>
                <Select 
                  placeholder="Select lab test template"
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                >
                  {templates ? (
                    templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading templates...</option>
                  )}
                </Select>
                <FormHelperText>Select the lab test collection you want to order</FormHelperText>
              </FormControl>
              
              <Box borderWidth="1px" borderRadius="lg" p={4} mt={2}>
                <Heading size="sm" mb={3}>Selected Test Collection Details</Heading>
                <Text fontSize="sm" color="gray.600">
                  Please select a lab test collection to see details
                </Text>
              </Box>

              <Heading size="md">Patient Details</Heading>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={patientForm.first_name}
                    onChange={(e) => handleFormChange('first_name', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={patientForm.last_name}
                    onChange={(e) => handleFormChange('last_name', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input
                    type="date"
                    value={patientForm.dob}
                    onChange={(e) => handleFormChange('dob', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup
                    value={patientForm.gender}
                    onChange={(value) => handleFormChange('gender', value)}
                  >
                    <Stack direction="row">
                      <Radio value="female">Female</Radio>
                      <Radio value="male">Male</Radio>
                      <Radio value="other">Other</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    value={patientForm.phone_number}
                    onChange={(e) => handleFormChange('phone_number', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={patientForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <Heading size="md">Address Information</Heading>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired gridColumn="span 2">
                  <FormLabel>Street Address</FormLabel>
                  <Input
                    value={patientForm.address_line}
                    onChange={(e) => handleFormChange('address_line', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>City</FormLabel>
                  <Input
                    value={patientForm.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>State</FormLabel>
                  <Select
                    placeholder="Select state"
                    value={patientForm.state}
                    onChange={(e) => handleFormChange('state', e.target.value)}
                  >
                    {US_STATES.map(state => (
                      <option key={state.code} value={state.code}>
                        {state.name} ({state.code})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>ZIP Code</FormLabel>
                  <Input
                    value={patientForm.zip}
                    onChange={(e) => handleFormChange('zip', e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Creating Order"
              isDisabled={!isFormValid()}
              sx={{
                '&:disabled': {
                  bg: 'gray.100',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  _hover: {
                    bg: 'gray.100'
                  }
                }
              }}
            >
              Confirm Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}