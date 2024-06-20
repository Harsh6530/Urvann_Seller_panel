import RNFetchBlob from 'rn-fetch-blob';
import XLSX from 'xlsx';

const readExcelFile = async (filePath) => {
  const path = `${RNFetchBlob.fs.dirs.DocumentDir}/${filePath}`;

  try {
    const res = await RNFetchBlob.fs.readFile(path, 'base64');

    // Convert to workbook
    const workbook = XLSX.read(res, { type: 'base64' });

    // Assume the first sheet is 'Sheet1'
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Extract seller names
    const sellerNames = XLSX.utils.sheet_to_json(sheet, { header: 'A' }).map((row) => row.A);
    
    // Get unique seller names
    const uniqueSellerNames = Array.from(new Set(sellerNames));

    return uniqueSellerNames;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
};

export default readExcelFile;
