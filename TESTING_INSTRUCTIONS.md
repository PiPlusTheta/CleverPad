# CleverPad Test Instructions

## Testing PDF Export
1. Open CleverPad in your browser at http://localhost:5173
2. Create a new note or use an existing one
3. Add some content (text, headings, lists, etc.)
4. Click the "Export PDF" button
5. Verify that the PDF downloads successfully

## Testing Markdown Import and Auto-Save
1. In CleverPad, look for an "Import" button or file upload option
2. Import the test-import.md file (located at d:/Documents/GitHub/CleverPad/test-import.md)
3. Verify that:
   - The markdown content is properly rendered
   - A new note is automatically created and saved
   - The note title is extracted from the filename or content

## Expected Behavior
- PDF export should work without errors and generate a properly formatted PDF
- Markdown import should create a new note that persists (visible in notes list)
- Both features should work for guest users (without authentication)

## If Issues Occur
- Check browser console for JavaScript errors
- Check the terminal output for server-side errors
- Verify that the imported note appears in the notes list
