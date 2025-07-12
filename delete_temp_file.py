import os

temp_file_path = r'C:/AI/food-truck-finder-poc/components/admin/dashboard/TrucksPage.temp.tsx'

if os.path.exists(temp_file_path):
    os.remove(temp_file_path)
    print(f"Successfully removed {temp_file_path}")
else:
    print(f"File not found: {temp_file_path}")
