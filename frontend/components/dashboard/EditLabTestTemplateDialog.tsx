import { 
    VStack,
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
    Select,
    Heading,
    useToast
} from "@chakra-ui/react";
import { fetcher, putData } from "../../lib/client";
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
  collection_methods: string[];
}

interface EditLabTestTemplateDialogProps {
  template: {
    id: string;
    name: string;
    method: string;
    markers: Marker[];
    lab: {
      id: number;
      name: string;
    };
  };
  onSuccess?: () => void;
}

interface TestFormData {
  name: string;
  method: string;
  marker_ids: number[];
  lab_id: number | undefined;
}

enum TestMethod {
  TESTKIT = "testkit",
  WALK_IN_TEST = "walk_in_test",
  AT_HOME_PHLEBOTOMY = "at_home_phlebotomy"
}

export const EditLabTestTemplateDialog = ({ template, onSuccess }: EditLabTestTemplateDialogProps) => {
  const [availableMarkers, setAvailableMarkers] = useState<Marker[]>([]);
  const [selectedMarkers, setSelectedMarkers] = useState<Marker[]>(template.markers || []);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [formData, setFormData] = useState<TestFormData>({
    name: template.name,
    method: template.method,
    marker_ids: template.markers?.map(marker => marker.id) || [],
    lab_id: template.lab.id,
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: labsData } = useSWR("/labs/", fetcher);
  const { data: markersData } = useSWR(
    formData.lab_id ? `/markers/?lab_id=${formData.lab_id}` : null,
    fetcher
  );

  const selectedLab = labs.find((lab: Lab) => lab.id === Number(formData.lab_id));

  const toast = useToast();

  useEffect(() => {
    if (labsData) {
      setLabs(labsData);
    }
  }, [labsData]);


  useEffect(() => {
    if (labsData && template.lab.id) {
      setLabs(labsData);
      const lab = labsData.find((lab: Lab) => lab.id === template.lab.id);
      if (lab) {
        setFormData(prev => ({
          ...prev,
          lab_id: lab.id,
          method: lab.collection_methods.includes(prev.method) ? prev.method : lab.collection_methods[0]
        }));
      }
    }
  }, [labsData, template.lab.id]);

  useEffect(() => {
    if (markersData?.markers) {
      setAvailableMarkers(markersData.markers);
    } else if (!formData.lab_id) {
      setAvailableMarkers([]);
      setSelectedMarkers([]);
    }
  }, [markersData, formData.lab_id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMarkerToggle = (marker: Marker) => {
    const isSelected = selectedMarkers.some(m => m.id === marker.id);
    
    if (isSelected) {
      setSelectedMarkers(prev => prev.filter(m => m.id !== marker.id));
      setFormData(prev => ({
        ...prev,
        marker_ids: prev.marker_ids.filter(id => id !== marker.id)
      }));
    } else {
      setSelectedMarkers(prev => [...prev, marker]);
      setFormData(prev => ({
        ...prev,
        marker_ids: [...prev.marker_ids, marker.id]
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      await putData(`/tests/${template.id}/`, formData);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      
      toast({
        title: "Test template updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating test template",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button size="sm" colorScheme="blue" onClick={onOpen}>
        Edit
      </Button>
      
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Lab Test Template</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Lab</FormLabel>
                <Select
                  name="lab_id"
                  value={formData.lab_id}
                  onChange={handleInputChange}
                  placeholder="Select lab"
                  required
                >
                  {labs.map((lab: Lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>Select the lab for this test template</FormHelperText>
              </FormControl>

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
                <FormLabel>Test Method</FormLabel>
                <Select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  placeholder="Select test method"
                  required
                >
                  {selectedLab?.collection_methods?.map((method: string) => (
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
                  {formData.lab_id ? (
                    availableMarkers.length > 0 ? (
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
                    )
                  ) : (
                    <Text fontSize="sm" color="gray.600">
                      Please select a lab first to view available markers
                    </Text>
                  )}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue"
              onClick={handleSubmit}
              isDisabled={!formData.name || !formData.method || selectedMarkers.length === 0}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 