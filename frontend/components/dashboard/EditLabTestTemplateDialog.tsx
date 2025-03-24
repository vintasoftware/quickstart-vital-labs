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
    Select
} from "@chakra-ui/react";
import { fetcher, putData } from "../../lib/client";
import useSWR from "swr";
import { useEffect, useState } from "react";

interface Marker {
  id: number;
  name: string;
  description: string;
}

interface EditLabTestTemplateDialogProps {
  template: {
    id: number;
    name: string;
    description: string;
    method: string;
    tests: Marker[];
  };
  onSuccess?: () => void;
}

interface TestFormData {
  name: string;
  description: string;
  method: string;
  marker_ids: number[];
}

enum TestMethod {
  TESTKIT = "testkit",
  WALK_IN_TEST = "walk_in_test",
  AT_HOME_PHLEBOTOMY = "at_home_phlebotomy"
}

export const EditLabTestTemplateDialog = ({ template, onSuccess }: EditLabTestTemplateDialogProps) => {
  const [availableMarkers, setAvailableMarkers] = useState<Marker[]>([]);
  const [selectedMarkers, setSelectedMarkers] = useState<Marker[]>(template.tests);
  const [formData, setFormData] = useState<TestFormData>({
    name: template.name,
    description: template.description,
    method: template.method,
    marker_ids: template.tests.map(test => test.id),
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = useSWR("/markers/", fetcher);

  useEffect(() => {
    if (data) {
      setAvailableMarkers(data.markers);
    }
  }, [data]);

  // ... existing handler functions from CreateLabTestTemplateDialog ...

  const handleSubmit = async () => {
    try {
      await putData(`/tests/${template.id}/`, formData);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error updating test:', error);
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
            {/* Same form structure as CreateLabTestTemplateDialog */}
            {/* ... existing form JSX ... */}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue"
              onClick={handleSubmit}
              isDisabled={!formData.name || !formData.description || !formData.method || selectedMarkers.length === 0}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 