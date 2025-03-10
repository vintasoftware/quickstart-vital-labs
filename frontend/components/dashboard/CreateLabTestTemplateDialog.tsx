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
    Checkbox
} from "@chakra-ui/react";
import { fetcher } from "../../lib/client";
import useSWR from "swr";
import { useEffect, useState } from "react";

interface Marker {
  id: number;
  name: string;
  description: string;
}

interface CreateLabTestTemplateDialogProps {
  initialMarkers?: Marker[];
}

export const CreateLabTestTemplateDialog = ({ initialMarkers = [] }: CreateLabTestTemplateDialogProps) => {
  const [availableMarkers, setAvailableMarkers] = useState<Marker[]>(initialMarkers);
  const [selectedMarkers, setSelectedMarkers] = useState<Marker[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = useSWR("/markers/", fetcher);

  useEffect(() => {
    if (data) {
      setAvailableMarkers(data.markers);
    }
  }, [data]);

  const handleMarkerToggle = (marker: Marker) => {
    setSelectedMarkers(prev => {
      const isSelected = prev.some(m => m.id === marker.id);
      if (isSelected) {
        return prev.filter(m => m.id !== marker.id);
      } else {
        return [...prev, marker];
      }
    });
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
              <Text fontWeight="medium">Create a new lab test template by selecting tests to include:</Text>
              
              <FormControl isRequired>
                <FormLabel>Template Name</FormLabel>
                <Input placeholder="Enter template name" />
                <FormHelperText>Give your template a descriptive name</FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Template Description</FormLabel>
                <Textarea placeholder="Enter description" />
                <FormHelperText>Provide details about when this template should be used</FormHelperText>
              </FormControl>
              
              <Box borderWidth="1px" borderRadius="lg" p={4}>
                <Heading size="sm" mb={3}>Available Tests</Heading>
                <Text mb={4}>Select tests to include in this template:</Text>
                
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
                      Loading available tests...
                    </Text>
                  )}
                </VStack>
              </Box>
              
              <Box borderWidth="1px" borderRadius="lg" p={4} mt={2}>
                <Heading size="sm" mb={3}>Template Summary</Heading>
                {selectedMarkers.length > 0 ? (
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" fontWeight="medium">Selected Tests ({selectedMarkers.length}):</Text>
                    {selectedMarkers.map(marker => (
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
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">
              Create Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}