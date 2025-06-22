import os
import sys
import argparse

def capture_project_files(project_path, output_filename):
    """
    Captures text file contents within a project directory, acknowledging binary files.
    Includes debug printing and smart directory/file skipping.

    Args:
        project_path (str): The path to the project directory.
        output_filename (str): The name of the file to save the output to.
    """
    # --- Basic Path Validation ---
    if not os.path.isdir(project_path):
        print(f"Error: The provided path '{project_path}' is not a valid directory.", file=sys.stderr)
        return

    project_abspath = os.path.abspath(project_path)
    output_abspath = os.path.abspath(output_filename)
    file_count = 0

    # --- Lists of items to explicitly exclude ---
    EXCLUDED_DIRS = {'.git', '.vscode', '__pycache__', 'node_modules', 'venv', '.idea'}
    EXCLUDED_FILES = {'.DS_Store'}
    
    # --- Extensions of binary files to acknowledge but not print content for ---
    BINARY_EXTENSIONS = {
        # Images
        '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp',
        # Documents
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        # Archives
        '.zip', '.tar', '.gz', '.rar', '.7z',
        # Executables & binaries
        '.exe', '.dll', '.bin', '.so', '.o',
        # Fonts
        '.ttf', '.otf', '.woff', '.woff2',
        # Media
        '.mp3', '.mp4', '.avi', '.mov', '.wav',
    }

    print("--- Starting Project Capture ---", file=sys.stderr)
    print(f"Project directory: {project_abspath}", file=sys.stderr)
    print(f"Output file: {output_abspath}", file=sys.stderr)
    print("-" * 30, file=sys.stderr)

    try:
        with open(output_filename, 'w', encoding='utf-8') as output_file:
            output_file.write(f"--- Capturing files in: {project_abspath} ---\n\n")

            for root, dirs, files in os.walk(project_path, topdown=True):
                # DEBUG: Show which directory is being processed
                print(f"[Scanning]: {root}", file=sys.stderr)
                dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

                for filename in files:
                    if filename in EXCLUDED_FILES:
                        continue
                    
                    file_path = os.path.join(root, filename)

                    if os.path.abspath(file_path) == output_abspath:
                        continue

                    file_count += 1
                    relative_path = os.path.relpath(file_path, project_path)
                    _, file_extension = os.path.splitext(filename)
                    is_binary = file_extension.lower() in BINARY_EXTENSIONS
                    
                    # Write file header for all files
                    output_file.write("=" * 70 + "\n")
                    output_file.write(f"File: {relative_path}\n")
                    output_file.write("=" * 70 + "\n\n")

                    if is_binary:
                        # Acknowledge the binary file but don't print its content
                        print(f"  [i] Acknowledging binary file: {relative_path}", file=sys.stderr)
                        output_file.write(f"[Content of binary file type ({file_extension}) is not captured.]\n\n\n")
                    else:
                        # Process as a text file
                        print(f"  [+] Capturing text content: {relative_path}", file=sys.stderr)
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                contents = f.read()
                                output_file.write(contents)
                        except Exception as e:
                            output_file.write(f"Could not read file. Reason: {e}\n")
                        
                        output_file.write("\n\n")

    except IOError as e:
        print(f"FATAL ERROR: Could not write to output file '{output_filename}'. Reason: {e}", file=sys.stderr)
        return

    # --- Final Summary ---
    print("-" * 30, file=sys.stderr)
    if file_count > 0:
        print(f"✅ Success! Processed {file_count} files and saved to '{output_filename}'")
    else:
        print(f"⚠️ Warning: No files were found in the project directory.", file=sys.stderr)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Capture project text files and acknowledge binary files, saving the result to a text file."
    )
    parser.add_argument(
        "project_path",
        nargs="?",
        default=".",
        help="The path to the project directory (defaults to the current directory).",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="project_contents.txt",
        help="The name of the output file (defaults to 'project_contents.txt').",
    )
    args = parser.parse_args()
    capture_project_files(args.project_path, args.output)