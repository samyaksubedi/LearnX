from pathlib import Path


def delete_file(file_path: str) -> None:
    path = Path(file_path)

    if path.exists():
        path.unlink()


def delete_files(*file_paths: str) -> None:
    for file_path in file_paths:
        delete_file(file_path)
