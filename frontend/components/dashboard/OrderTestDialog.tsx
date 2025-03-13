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
    Select
} from "@chakra-ui/react";
import { fetcher } from "../../lib/client";
import useSWR from "swr";

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

export const OrderTestDialog = () => {
  // Add useDisclosure hook to control the modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = useSWR("/users/", fetcher);
  const { data: templates } = useSWR<LabTestTemplate[]>("/tests/", fetcher);

  const usersFiltered = data?.users ? data.users : [];
  
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
                <Select placeholder="Select patient">
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
                <Select placeholder="Select Collection Method">
                  <option value="at-home">At-Home</option>
                  <option value="walk-in">Walk-In</option>
                  <option value="self-test-kit">Self-test kit</option>
                </Select>
                <FormHelperText>Select who will be paying for the test</FormHelperText>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Lab Test Template</FormLabel>
                <Select placeholder="Select lab test template">
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
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">
              Confirm Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}