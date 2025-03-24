import { 
    VStack,
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
    Input,
    Textarea,
    Checkbox,
    Select
} from "@chakra-ui/react";
import { fetcher, postData } from "../../lib/client";
import useSWR from "swr";
import { useEffect, useState } from "react";

interface Marker {
  id: number;
  name: string;
  description: string;
}

interface Lab {
  id: number;
  name: string;
  collection_methods: TestMethod[];
}

interface CreateLabTestTemplateDialogProps {
  initialMarkers?: Marker[];
}

interface TestFormData {
  name: string;
  description: string;
  method: string;
  marker_ids: number[];
  lab_id?: number;
}

enum TestMethod {
  TESTKIT = "testkit",
  WALK_IN_TEST = "walk_in_test",
  AT_HOME_PHLEBOTOMY = "at_home_phlebotomy"
}

export const CreateLabTestTemplateDialog = ({ initialMarkers = [] }: CreateLabTestTemplateDialogProps) => {
  const [availableMarkers, setAvailableMarkers] = useState<Marker[]>(initialMarkers);
  const [selectedMarkers, setSelectedMarkers] = useState<Marker[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [formData, setFormData] = useState<TestFormData>({
    name: '',
    description: '',
    method: '',
    marker_ids: [],
    lab_id: undefined,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: labsData } = useSWR("/labs/", fetcher);
  const { data: markersData } = useSWR(
    formData.lab_id ? `/markers/?lab_id=${formData.lab_id}` : null,
    fetcher
  );

  // Get the selected lab's collection methods
  const selectedLab = labs.find((lab: Lab) => lab.id === Number(formData.lab_id));

  useEffect(() => {
    if (labsData) {
      setLabs(labsData);
    }
  }, [labsData]);

  useEffect(() => {
    if (markersData?.markers) {
      setAvailableMarkers(markersData.markers);
    } else if (!formData.lab_id) {
      // Clear markers when no lab is selected
      setAvailableMarkers([]);
      setSelectedMarkers([]);
    }
  }, [markersData, formData.lab_id]);

  const handleMarkerToggle = (marker: Marker) => {
    const isSelected = selectedMarkers.some((m: Marker) => m.id === marker.id);
    
    setSelectedMarkers((prev: Marker[]) => {
      if (isSelected) {
        return prev.filter((m: Marker) => m.id !== marker.id);
      } else {
        return [...prev, marker];
      }
    });

    setFormData((prev: TestFormData) => ({
      ...prev,
      marker_ids: isSelected ? 
        prev.marker_ids.filter((id: number) => id !== marker.id) :
        [...prev.marker_ids, marker.id]
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Clear markers, selected markers, and method when lab changes
    if (name === 'lab_id') {
      setAvailableMarkers([]);
      setSelectedMarkers([]);
      setFormData((prev: TestFormData) => ({
        ...prev,
        [name]: value,
        marker_ids: [], // Reset marker_ids when lab changes
        method: '', // Reset method when lab changes
      }));
    } else {
      setFormData((prev: TestFormData) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      await postData('/tests/', formData);
      
      // Reset form and close modal on success
      setFormData({
        name: '',
        description: '',
        method: '',
        marker_ids: [],
        lab_id: undefined,
      });
      setSelectedMarkers([]);
      onClose();
    } catch (error) {
      console.error('Error creating test:', error);
      // You might want to add error handling UI here
    }
  };

  return (
    <Box>
      <Button colorScheme="blue" onClick={onOpen}>Create Test Template</Button>
      
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Lab Test Template</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Test Name</FormLabel>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter test name"
                  required
                />
                <FormHelperText>Give your test a descriptive name</FormHelperText>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Test Description</FormLabel>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  required
                />
                <FormHelperText>Provide details about this test</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Select Lab</FormLabel>
                <Select
                  name="lab_id"
                  value={formData.lab_id || ''}
                  onChange={handleInputChange}
                  placeholder="Select a lab to continue"
                  required
                >
                  {labs.map((lab: Lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>Choose a lab to see available options</FormHelperText>
              </FormControl>

              {formData.lab_id && selectedLab && (
                <>
                  <FormControl isRequired>
                    <FormLabel>Test Method</FormLabel>
                    <Select
                      name="method"
                      value={formData.method}
                      onChange={handleInputChange}
                      placeholder="Select test method"
                      required
                    >
                      {selectedLab.collection_methods.map((method: TestMethod) => (
                        <option key={method} value={method}>
                          {method === TestMethod.TESTKIT ? "Test Kit" :
                           method === TestMethod.WALK_IN_TEST ? "Walk-in Test" :
                           "At-home Phlebotomy"}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>Select the method for this test</FormHelperText>
                  </FormControl>

                  <Box borderWidth="1px" borderRadius="lg" p={4}>
                    <Heading size="sm" mb={3}>Available Biomarkers</Heading>
                    <Text mb={4}>Select biomarkers to include in this template:</Text>
                    
                    <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                      {availableMarkers.length > 0 ? (
                        availableMarkers.map((marker: Marker) => (
                          <Checkbox 
                            key={marker.id} 
                            isChecked={selectedMarkers.some(m => m.id === marker.id)}
                            onChange={() => handleMarkerToggle(marker)}
                          >
                            {marker.name} - {marker.description}
                          </Checkbox>
                        ))
                      ) : (
                        <Text fontSize="sm" color="gray.600">
                          Loading available biomarkers...
                        </Text>
                      )}
                    </VStack>
                  </Box>
                  
                  <Box borderWidth="1px" borderRadius="lg" p={4} mt={2}>
                    <Heading size="sm" mb={3}>Template Summary</Heading>
                    {selectedMarkers.length > 0 ? (
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">Selected Tests ({selectedMarkers.length}):</Text>
                        {selectedMarkers.map((marker: Marker) => (
                          <Text key={marker.id} fontSize="sm" color="gray.600">
                            • {marker.name}
                          </Text>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.600">
                        Select tests above to see a summary of your template
                      </Text>
                    )}
                  </Box>
                </>
              )}

              {!formData.lab_id && (
                <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
                  <Text color="gray.600" textAlign="center">
                    Please select a lab to view available options and biomarkers
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue"
              onClick={handleSubmit}
              isDisabled={!formData.lab_id || !formData.name || !formData.description || !formData.method || selectedMarkers.length === 0}
            >
              Create Test
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}