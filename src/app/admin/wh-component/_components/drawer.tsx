import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: WorkingOrder | null;
}

interface WorkingOrder {
  TGL_PROD: string;
  PDNO: string;
  MITM: string;
  CWAR: string;
  QTY: number;
  LINE: number;
  STATUS: number;
}

interface Box {
  id_box: number;
  name_box: string;
  no_wo: string;
  status_box: string;
  kategori_box: string;
}

interface BomItem {
  T$SITM: string;
  QTY_ALL: number;
  selectedBox?: string;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  selectedOrder,
}) => {
  const [bomData, setBomData] = useState<BomItem[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBomData = async () => {
      if (!selectedOrder?.PDNO) return; // Use PDNO for the new API

      setIsLoading(true);
      setError(null);

      try {
        // Fetch estimate parts from the new API
        const response = await axios.get(
          `https://portal2.incoe.astra.co.id:3007/api_v2/lithium/getEstimatePartLithium`,
          {
            params: {
              wo: selectedOrder.PDNO // Use the selected order's WO number
            },
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            }
          }
        );

        // Use a Set to ensure distinct PART_COMPONENT values
        const uniqueParts = new Set<string>();

        // Filter and trim the response data
        response.data.forEach((item: any) => {
          const partComponent = item.PART_COMPONENT.trim();
          if (partComponent.startsWith("K-")) {
            uniqueParts.add(partComponent); // Add to the Set for uniqueness
          }
        });

        // Map the unique parts to the BomItem structure
        const processedData: BomItem[] = Array.from(uniqueParts).map(part => ({
          T$SITM: part, // Use the unique PART_COMPONENT
          QTY_ALL: response.data.find((item: any) => item.PART_COMPONENT.trim() === part)?.QTY || 0, // Get the corresponding QTY
          selectedBox: '' // Initialize selectedBox
        }));

        // Fetch all matching boxes for the selected order's WO number
        const matchingResponse = await axios.get(`https://portal4.incoe.astra.co.id:4434/api/get_data_matching_box`, {
          params: {
            no_wo: selectedOrder?.PDNO, // Use the selected order's WO number
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });

        // Create a mapping of pn to id_box
        const matchingBoxesMap: { [key: string]: string } = {}; // Define the type for the mapping
        matchingResponse.data.matching_boxes.forEach((box: any) => {
          matchingBoxesMap[box.pn] = box.id_box; // Map pn to id_box
        });

        // Set the selectedBox based on the mapping
        processedData.forEach((item: BomItem) => { // Specify the type for item
          if (matchingBoxesMap[item.T$SITM]) {
            item.selectedBox = matchingBoxesMap[item.T$SITM]; // Set the default selectedBox
          }
        });

        setBomData(processedData);
      } catch (err) {
        setError('Failed to fetch BOM data');
        console.error('Error fetching BOM data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBoxes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get('https://portal4.incoe.astra.co.id:4434/api/get_data_master_box', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add token here
            'Content-Type': 'application/json',
          }
        });
        const fetchedBoxes = response.data.boxes.map((box: any) => ({
          id_box: box.id_box,
          name_box: box.name_box,
          no_wo: box.no_wo,
          status_box: box.status_box,
          kategori_box: box.kategori_box,
        }));

        setBoxes(fetchedBoxes);
      } catch (err) {
        setError('Failed to fetch box data');
        console.error('Error fetching box data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && selectedOrder) {
      fetchBomData();
      fetchBoxes();
    }
  }, [isOpen, selectedOrder]);

  const handleBoxSelect = (componentIndex: number, boxId: string) => {
    setBomData(prevData => {
      const newData = [...prevData];
      newData[componentIndex] = { ...newData[componentIndex], selectedBox: boxId };
      return newData;
    });
  };

  const handleSaveChanges = async () => {
    const matchingBoxes = bomData
      .filter(item => item.selectedBox) // Only include items with a selected box
      .map(item => ({
        id_box: item.selectedBox, // Use the selectedBox
        no_wo: selectedOrder?.PDNO,
        pn: item.T$SITM,
        pn_wo: selectedOrder?.MITM,
        pn_sequence: 1, // Default value
        pn_qty: item.QTY_ALL,
        status_matching: "1", // Default status
        station: "component" // Default status
      }));

    // Proceed to save changes if there are matching boxes
    if (matchingBoxes.length > 0) {
      try {
        const response = await axios.post('https://portal4.incoe.astra.co.id:4434/api/insert_matching_box', matchingBoxes, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 201) {
          alert('Matching boxes inserted successfully');
          onClose(); // Close the drawer after successful insertion
        }
      } catch (err) {
        console.error('Error saving changes:', err);
        alert('Failed to save changes');
      }
    } else {
      alert('No matching boxes found to save.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 w-[800px] h-full overflow-y-auto bg-white shadow-xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Work Order Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Drawer Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="woNumber">WO Number</Label>
                <Input
                  id="woNumber"
                  value={selectedOrder?.PDNO || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material Item</Label>
                <Input
                  id="material"
                  value={selectedOrder?.MITM || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={selectedOrder?.QTY.toString() || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Production Date</Label>
                <Input
                  id="date"
                  value={selectedOrder ? new Date(selectedOrder.TGL_PROD).toLocaleDateString() : ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Input
                  id="warehouse"
                  value={selectedOrder?.CWAR || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={selectedOrder?.STATUS === 1 ? 'Running' : 'Pending'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* BOM Components Table */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Components</h3>
            {isLoading ? (
              <div className="p-4 text-center">Loading BOM data...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">Component</th>
                      <th className="w-24 px-4 py-3 text-sm font-semibold text-center text-gray-600">Qty</th>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">Available Box</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bomData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{item.T$SITM}</td>
                        <td className="px-4 py-3 text-center">{item.QTY_ALL}</td>
                        <td className="px-4 py-3">
                          <Select
                            value={item.selectedBox || ''} // Use selectedBox or empty string
                            onValueChange={(value) => handleBoxSelect(index, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select box" />
                            </SelectTrigger>
                            <SelectContent>
                              {boxes.map((box) => (
                                <SelectItem key={box.id_box} value={box.name_box}>
                                  {box.name_box}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button 
              type="button" 
              className="w-full"
              variant="default"
              onClick={handleSaveChanges} // Call the save function on click
            >
              Save Changes
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
